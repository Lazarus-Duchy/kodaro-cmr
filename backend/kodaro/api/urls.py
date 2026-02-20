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
from Clients.views import (
    ClientDetailView,
    ClientListCreateView,
    ClientStatsView,
    ContactDetailView,
    ContactListCreateView,
)

from Products.views import (
    CategoryDetailView,
    CategoryListCreateView,
    ProductDetailView,
    ProductListCreateView,
    ProductStatsView,
)

urlpatterns = [
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
    
    # ── Clients ───────────────────────────────────────────────────────────────
    path("clients/", ClientListCreateView.as_view(), name="client-list"),
    path("clients/stats/", ClientStatsView.as_view(), name="client-stats"),
    path("clients/<uuid:pk>/", ClientDetailView.as_view(), name="client-detail"),

    # ── Contacts (nested under a client) ─────────────────────────────────────
    path("clients/<uuid:client_pk>/contacts/", ContactListCreateView.as_view(), name="contact-list"),
    path("clients/<uuid:client_pk>/contacts/<uuid:pk>/", ContactDetailView.as_view(), name="contact-detail"),

     # ── Categories ────────────────────────────────────────────────────────────
    path("products/categories/", CategoryListCreateView.as_view(), name="category-list"),
    path("products/categories/<uuid:pk>/", CategoryDetailView.as_view(), name="category-detail"),

    # ── Products ──────────────────────────────────────────────────────────────
    path("products/", ProductListCreateView.as_view(), name="product-list"),
    path("products/stats/", ProductStatsView.as_view(), name="product-stats"),
    path("products/<uuid:pk>/", ProductDetailView.as_view(), name="product-detail"),

]