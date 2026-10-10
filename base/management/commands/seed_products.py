from django.core.management.base import BaseCommand
from base.models import Product

PRODUCTS = [
    {'name': 'Airpods Wireless Bluetooth Headphones', 'image': 'airpods.jpg',
     'description': 'Bluetooth technology lets you connect it with compatible devices wirelessly. High-quality AAC audio offers immersive listening experience. Built-in microphone allows you to take calls while working.',
     'brand': 'Apple', 'category': 'Electronics', 'price': 89.99,
     'countInStock': 10, 'rating': 4.5, 'numReviews': 12},
    {'name': 'iPhone 11 Pro 256GB Memory', 'image': 'phone.jpg',
     'description': 'Introducing the iPhone 11 Pro. A transformative triple-camera system that adds tons of capability without complexity. An unprecedented leap in battery life.',
     'brand': 'Apple', 'category': 'Electronics', 'price': 599.99,
     'countInStock': 0, 'rating': 4.0, 'numReviews': 8},
    {'name': 'Canon EOS 80D DSLR Camera', 'image': 'camera.jpg',
     'description': 'Characterized by versatile imaging specs, the Canon EOS 80D further clarifies itself using a pair of robust focusing systems and an intuitive design.',
     'brand': 'Canon', 'category': 'Electronics', 'price': 929.99,
     'countInStock': 5, 'rating': 3.0, 'numReviews': 12},
    {'name': 'Sony Playstation 4 Pro White Version', 'image': 'playstation.jpg',
     'description': 'The ultimate home entertainment center starts with PlayStation. Whether you are into gaming, HD movies, television, music.',
     'brand': 'Sony', 'category': 'Electronics', 'price': 399.99,
     'countInStock': 11, 'rating': 5.0, 'numReviews': 12},
    {'name': 'Logitech G-Series Gaming Mouse', 'image': 'mouse.jpg',
     'description': 'Get a better handle on your games with this Logitech LIGHTSYNC gaming mouse. The six programmable buttons allow customization for a smooth playing experience.',
     'brand': 'Logitech', 'category': 'Electronics', 'price': 49.99,
     'countInStock': 7, 'rating': 3.5, 'numReviews': 10},
    {'name': 'Amazon Echo Dot 3rd Generation', 'image': 'alexa.jpg',
     'description': 'Meet Echo Dot - our most popular smart speaker with a fabric design. It is our most compact smart speaker that fits perfectly into small spaces.',
     'brand': 'Amazon', 'category': 'Electronics', 'price': 29.99,
     'countInStock': 0, 'rating': 4.0, 'numReviews': 12},
]


class Command(BaseCommand):
    help = 'Create or update the sample products'

    def handle(self, *args, **options):
        for data in PRODUCTS:
            product, created = Product.objects.update_or_create(
                name=data['name'], defaults=data)
            action = 'Created' if created else 'Updated'
            self.stdout.write(f'{action}: {product.name}')
        self.stdout.write(self.style.SUCCESS('Done!'))