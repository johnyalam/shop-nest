from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from base.serializers import UserSerializer, UserSerializerWithToken


def bad_request(message):
    return Response({'detail': message}, status=status.HTTP_400_BAD_REQUEST)

def set_email(user, email):
    """Change user's email if valid and free. Returns an error message, or None."""
    if not email or email == user.email:
        return None
    try:
        validate_email(email)
    except ValidationError:
        return 'Enter a valid email address'
    if User.objects.filter(username=email).exclude(pk=user.pk).exists():
        return 'User with this email already exists'
    user.email = email
    return None
# ---------- Login ----------

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        attrs['username'] = attrs['username'].strip().lower()
        data = super().validate(attrs)          # checks the password
        data.update(UserSerializerWithToken(self.user).data)
        return data


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# ---------- Register ----------

@api_view(['POST'])
def registerUser(request):
    name = (request.data.get('name') or '').strip()
    email = (request.data.get('email') or '').strip().lower()
    password = request.data.get('password') or ''

    if not name or not email or not password:
        return bad_request('Name, email and password are required')

    try:
        validate_email(email)
    except ValidationError:
        return bad_request('Enter a valid email address')

    if User.objects.filter(username=email).exists():
        return bad_request('User with this email already exists')

    try:
        validate_password(password, User(username=email, email=email, first_name=name))
    except ValidationError as e:
        return bad_request(' '.join(e.messages))

    user = User.objects.create_user(
        username=email, email=email, password=password, first_name=name)
    return Response(UserSerializerWithToken(user).data, status=status.HTTP_201_CREATED)


# ---------- Profile ----------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserProfile(request):
    return Response(UserSerializer(request.user).data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateUserProfile(request):
    user = request.user
    name = (request.data.get('name') or '').strip()
    email = (request.data.get('email') or '').strip().lower()
    password = request.data.get('password') or ''

    if name:
        user.first_name = name

    error = set_email(user, email)
    if error:
        return bad_request(error)

    if password:
        try:
            validate_password(password, user)
        except ValidationError as e:
            return bad_request(' '.join(e.messages))
        user.set_password(password)

    user.save()
    return Response(UserSerializerWithToken(user).data)

# ---------- Admin only ----------

def get_user_or_404(pk):
    return User.objects.filter(pk=pk).first()


@api_view(['GET'])
@permission_classes([IsAdminUser])
def getUsers(request):
    users = User.objects.order_by('-date_joined')
    return Response(UserSerializer(users, many=True).data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def getUserById(request, pk):
    user = get_user_or_404(pk)
    if user is None:
        return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response(UserSerializer(user).data)


@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateUser(request, pk):
    user = get_user_or_404(pk)
    if user is None:
        return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    name = (request.data.get('name') or '').strip()
    email = (request.data.get('email') or '').strip().lower()

    if name:
        user.first_name = name

    error = set_email(user, email)
    if error:
        return bad_request(error)

    if 'isAdmin' in request.data:
        is_admin = request.data.get('isAdmin') is True
        if user == request.user and not is_admin:
            return bad_request('You cannot remove your own admin rights')
        user.is_staff = is_admin

    user.save()
    return Response(UserSerializer(user).data)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteUser(request, pk):
    user = get_user_or_404(pk)
    if user is None:
        return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    if user == request.user:
        return bad_request('You cannot delete your own account')
    if user.is_superuser:
        return bad_request('Superusers can only be deleted in the Django admin panel')

    user.delete()
    return Response({'detail': 'User deleted'})

    