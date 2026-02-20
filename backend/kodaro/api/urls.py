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

from Purchases.views import (
    PurchaseDetailView,
    PurchaseListCreateView,
    PurchasesByClientCountryView,
    PurchasesByClientView,
    PurchasesByCategoryView,
    PurchasesByDayView,
    PurchasesByMonthAllYearsView,
    PurchasesByMonthYearView,
    PurchasesByProductView,
    PurchasesOverPriceView,
    PurchaseStatsView,
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

        # ── CRUD ──────────────────────────────────────────────────────────────────
    path("purchases/", PurchaseListCreateView.as_view(), name="purchase-list"),
    path("purchases/stats/", PurchaseStatsView.as_view(), name="purchase-stats"),
    path("purchases/<uuid:pk>/", PurchaseDetailView.as_view(), name="purchase-detail"),

    # ── Filtered views ─────────────────────────────────────────────────────────
    # All purchases of a product
    path("purchases/by-product/<uuid:product_id>/", PurchasesByProductView.as_view(), name="purchases-by-product"),

    # All purchases on a specific date  →  /purchases/by-day/2024-03-15/
    path("purchases/by-day/<str:date>/", PurchasesByDayView.as_view(), name="purchases-by-day"),

    # All purchases in a product category
    path("purchases/by-category/<uuid:category_id>/", PurchasesByCategoryView.as_view(), name="purchases-by-category"),

    # All purchases in a specific month + year  →  /purchases/by-month/2024/3/
    path("purchases/by-month/<int:year>/<int:month>/", PurchasesByMonthYearView.as_view(), name="purchases-by-month-year"),

    # All purchases in a month number across ALL years  →  /purchases/by-month/3/
    path("purchases/by-month/<int:month>/", PurchasesByMonthAllYearsView.as_view(), name="purchases-by-month-all-years"),

    # All purchases by a client
    path("purchases/by-client/<uuid:client_id>/", PurchasesByClientView.as_view(), name="purchases-by-client"),

    # All purchases over a price  →  /purchases/over-price/?price=500&currency=PLN
    path("purchases/over-price/", PurchasesOverPriceView.as_view(), name="purchases-over-price"),

    # All purchases by client's country  →  /purchases/by-country/Poland/
    path("purchases/by-country/<str:country>/", PurchasesByClientCountryView.as_view(), name="purchases-by-country"),
]
