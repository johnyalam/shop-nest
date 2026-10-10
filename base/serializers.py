from rest_framework import serializers
from .models import Product, Review
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    reviews = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

    def get_reviews(self, obj):
        return ReviewSerializer(obj.review_set.all(), many=True).data

class UserSerializer(serializers.ModelSerializer):
    _id = serializers.ReadOnlyField(source='id')
    name = serializers.SerializerMethodField()
    isAdmin = serializers.ReadOnlyField(source='is_staff')

    class Meta:
        model = User
        fields = ['id', '_id', 'username', 'email', 'name', 'isAdmin']

    def get_name(self, obj):
        return obj.first_name or obj.email


class UserSerializerWithToken(UserSerializer):
    token = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['token']

    def get_token(self, obj):
        return str(RefreshToken.for_user(obj).access_token)