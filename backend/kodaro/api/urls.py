from django.urls import path
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
from Pracownicy.views import (
    PracownikListCreateView,
    PracownikDetailView,
    PracownikStatsView,
    KontaktAwaryjnyListCreateView,
    KontaktAwaryjnyDetailView,
)

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────────────────────
    path("auth/register/",      RegisterView.as_view(),     name="auth-register"),
    path("auth/login/",         LoginView.as_view(),        name="auth-login"),
    path("auth/logout/",        LogoutView.as_view(),       name="auth-logout"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),

    # ── Current user ──────────────────────────────────────────────────────────
    path("users/me/",                  MeView.as_view(),             name="user-me"),
    path("users/me/change-password/",  ChangePasswordView.as_view(), name="user-change-password"),

    # ── Admin ─────────────────────────────────────────────────────────────────
    path("users/",           UserListView.as_view(),   name="user-list"),
    path("users/<uuid:pk>/", UserDetailView.as_view(), name="user-detail"),

    # ── Incidents / Cases (formerly Clients) ──────────────────────────────────
    path("incidents/",              ClientListCreateView.as_view(), name="incident-list"),
    path("incidents/stats/",        ClientStatsView.as_view(),      name="incident-stats"),
    path("incidents/<uuid:pk>/",    ClientDetailView.as_view(),     name="incident-detail"),

    # ── Reporters / Witnesses nested under an incident ─────────────────────────
    path("incidents/<uuid:client_pk>/contacts/",              ContactListCreateView.as_view(), name="reporter-list"),
    path("incidents/<uuid:client_pk>/contacts/<uuid:pk>/",    ContactDetailView.as_view(),     name="reporter-detail"),

    # ── Equipment Categories ───────────────────────────────────────────────────
    path("equipment/categories/",           CategoryListCreateView.as_view(), name="category-list"),
    path("equipment/categories/<uuid:pk>/", CategoryDetailView.as_view(),     name="category-detail"),

    # ── Equipment Items ────────────────────────────────────────────────────────
    path("equipment/",           ProductListCreateView.as_view(), name="equipment-list"),
    path("equipment/stats/",     ProductStatsView.as_view(),      name="equipment-stats"),
    path("equipment/<uuid:pk>/", ProductDetailView.as_view(),     name="equipment-detail"),

    # ── Missions / Operations (formerly Purchases) ─────────────────────────────
    path("missions/",              PurchaseListCreateView.as_view(), name="mission-list"),
    path("missions/stats/",        PurchaseStatsView.as_view(),      name="mission-stats"),
    path("missions/<uuid:pk>/",    PurchaseDetailView.as_view(),     name="mission-detail"),

    # Filtered mission views
    path("missions/by-equipment/<uuid:product_id>/",        PurchasesByProductView.as_view(),        name="missions-by-equipment"),
    path("missions/by-day/<str:date>/",                     PurchasesByDayView.as_view(),            name="missions-by-day"),
    path("missions/by-category/<uuid:category_id>/",        PurchasesByCategoryView.as_view(),       name="missions-by-category"),
    path("missions/by-month/<int:year>/<int:month>/",       PurchasesByMonthYearView.as_view(),      name="missions-by-month-year"),
    path("missions/by-month/<int:month>/",                  PurchasesByMonthAllYearsView.as_view(),  name="missions-by-month-all-years"),
    path("missions/by-incident/<uuid:client_id>/",          PurchasesByClientView.as_view(),         name="missions-by-incident"),
    path("missions/over-price/",                            PurchasesOverPriceView.as_view(),        name="missions-over-price"),
    path("missions/by-country/<str:country>/",              PurchasesByClientCountryView.as_view(),  name="missions-by-country"),

    # ── Rescuers / Team Members (formerly Pracownicy) ──────────────────────────
    path("rescuers/",              PracownikListCreateView.as_view(), name="rescuer-list"),
    path("rescuers/stats/",        PracownikStatsView.as_view(),      name="rescuer-stats"),
    path("rescuers/<uuid:pk>/",    PracownikDetailView.as_view(),     name="rescuer-detail"),

    # Emergency contacts nested under a rescuer
    path("rescuers/<uuid:pracownik_pk>/emergency-contacts/",              KontaktAwaryjnyListCreateView.as_view(), name="emergency-contact-list"),
    path("rescuers/<uuid:pracownik_pk>/emergency-contacts/<uuid:pk>/",    KontaktAwaryjnyDetailView.as_view(),     name="emergency-contact-detail"),
]