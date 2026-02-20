from django.urls import path
from .views import ItemsView
from rest_framework_simplejwt.views import TokenRefreshView
from Users.views import (
    ChangePasswordView,
    LoginView,
    LogoutView,
    MeView,
    RegisterView,
    UserDetailView,
    UserListView,
)
urlpatterns = [
    path('items/', ItemsView.as_view(), name='items'),
    # ── Auth ──────────────────────────────────────────────────────────────────
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),

    # ── Current user ──────────────────────────────────────────────────────────
    path("users/me/", MeView.as_view(), name="user-me"),
    path("users/me/change-password/", ChangePasswordView.as_view(), name="user-change-password"),

    # ── Admin ─────────────────────────────────────────────────────────────────
    path("users/", UserListView.as_view(), name="user-list"),
    path("users/<uuid:pk>/", UserDetailView.as_view(), name="user-detail"),
]