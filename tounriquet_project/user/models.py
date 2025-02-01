from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import uuid

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        """
        Create and return a regular user with an email and password.
        """
        if not username:
            raise ValueError('The Username field must be set')
        if not email:
            raise ValueError('The Email field must be set')
        if not password:
            raise ValueError('The Password field must be set')

        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        """
        Create and return a superuser with all permissions and active status.
        """
        if not email:
            raise ValueError('The Email field must be set')
        
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)  # Ensure superusers are active
        
        return self.create_user(username=username, email=email, password=password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(blank=True, null=False, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)  # Indicates superuser status

    # Boolean fields for page permissions
    can_manage_device = models.BooleanField(default=False)
    can_manage_access = models.BooleanField(default=False)
    can_manage_role = models.BooleanField(default=False)
    can_manage_timezone = models.BooleanField(default=False)
    can_manage_assignment = models.BooleanField(default=False)
    can_manage_bracelet = models.BooleanField(default=False)
    can_manage_settings = models.BooleanField(default=False)
    can_manage_door=models.BooleanField(default=False)
    
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def save(self, *args, **kwargs):
        """
        Override save method to automatically set all permissions to True for superusers.
        """
        if self.is_superuser:
            self.is_staff = True
            self.is_active = True
            self.can_manage_device = True
            self.can_manage_access = True
            self.can_manage_role = True
            self.can_manage_timezone = True
            self.can_manage_assignment = True
            self.can_manage_bracelet = True
            self.can_manage_settings = True
            self.can_manage_door=True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"User(username={self.username}, email={self.email})"

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['username']


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return timezone.now() > self.expires_at
