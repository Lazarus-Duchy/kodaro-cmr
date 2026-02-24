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
    SurvivorDetailView,
    SurvivorListCreateView,
    SurvivorStatsView,
    SurvivorContactDetailView,
    SurvivorContactListCreateView,
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
    RescuerListCreateView,
    RescuerDetailView,
    RescuerStatsView,
    EmergencyContactListCreateView,
    EmergencyContactDetailView,
)


urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────────────────────
    path("auth/register/",      RegisterView.as_view(),     name="auth-register"),
    path("auth/login/",         LoginView.as_view(),        name="auth-login"),
    path("auth/logout/",        LogoutView.as_view(),       name="auth-logout"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),

    # ── Current user ──────────────────────────────────────────────────────────
    path("users/me/",                 MeView.as_view(),             name="user-me"),
    path("users/me/change-password/", ChangePasswordView.as_view(), name="user-change-password"),

    # ── Admin ─────────────────────────────────────────────────────────────────
    path("users/",           UserListView.as_view(),   name="user-list"),
    path("users/<uuid:pk>/", UserDetailView.as_view(), name="user-detail"),

    # ── Survivors ─────────────────────────────────────────────────────────────
    path("survivors/",           SurvivorListCreateView.as_view(), name="survivor-list"),
    path("survivors/stats/",     SurvivorStatsView.as_view(),      name="survivor-stats"),
    path("survivors/<uuid:pk>/", SurvivorDetailView.as_view(),     name="survivor-detail"),

    # ── Survivor Contacts (nested) ────────────────────────────────────────────
    path("survivors/<uuid:survivor_pk>/contacts/",           SurvivorContactListCreateView.as_view(), name="survivor-contact-list"),
    path("survivors/<uuid:survivor_pk>/contacts/<uuid:pk>/", SurvivorContactDetailView.as_view(),     name="survivor-contact-detail"),

    # ── Equipment Categories ───────────────────────────────────────────────────
    path("equipment/categories/",           CategoryListCreateView.as_view(), name="category-list"),
    path("equipment/categories/<uuid:pk>/", CategoryDetailView.as_view(),     name="category-detail"),

    # ── Equipment Items ────────────────────────────────────────────────────────
    path("equipment/",           ProductListCreateView.as_view(), name="equipment-list"),
    path("equipment/stats/",     ProductStatsView.as_view(),      name="equipment-stats"),
    path("equipment/<uuid:pk>/", ProductDetailView.as_view(),     name="equipment-detail"),

    # ── Rescue Operations – CRUD ───────────────────────────────────────────────
    path("rescues/",           PurchaseListCreateView.as_view(), name="rescue-list"),
    path("rescues/stats/",     PurchaseStatsView.as_view(),      name="rescue-stats"),
    path("rescues/<uuid:pk>/", PurchaseDetailView.as_view(),     name="rescue-detail"),

    # ── Rescue Operations – Filtered ───────────────────────────────────────────
    # All rescues that used a specific piece of equipment
    path("rescues/by-equipment/<uuid:product_id>/",        PurchasesByProductView.as_view(),       name="rescues-by-equipment"),
    # All rescues on a specific date  →  /rescues/by-day/2024-03-15/
    path("rescues/by-day/<str:date>/",                     PurchasesByDayView.as_view(),           name="rescues-by-day"),
    # All rescues using equipment from a given category
    path("rescues/by-category/<uuid:category_id>/",        PurchasesByCategoryView.as_view(),      name="rescues-by-category"),
    # All rescues in a specific month + year  →  /rescues/by-month/2024/3/
    path("rescues/by-month/<int:year>/<int:month>/",       PurchasesByMonthYearView.as_view(),     name="rescues-by-month-year"),
    # All rescues in a month number across ALL years (seasonal patterns)
    path("rescues/by-month/<int:month>/",                  PurchasesByMonthAllYearsView.as_view(), name="rescues-by-month-all-years"),
    # All rescues involving a specific survivor
    path("rescues/by-survivor/<uuid:client_id>/",          PurchasesByClientView.as_view(),        name="rescues-by-survivor"),
    # All rescues where equipment cost exceeded a threshold  →  /rescues/over-cost/?price=500&currency=PLN
    path("rescues/over-cost/",                             PurchasesOverPriceView.as_view(),       name="rescues-over-cost"),
    # All rescues involving survivors from a given country
    path("rescues/by-country/<str:country>/",              PurchasesByClientCountryView.as_view(), name="rescues-by-country"),

    # ── Rescuers / Team Members ────────────────────────────────────────────────
    path("rescuers/",           RescuerListCreateView.as_view(), name="rescuer-list"),
    path("rescuers/stats/",     RescuerStatsView.as_view(),      name="rescuer-stats"),
    path("rescuers/<uuid:pk>/", RescuerDetailView.as_view(),     name="rescuer-detail"),

    # ── Rescuer Emergency Contacts (nested) ────────────────────────────────────
    path("rescuers/<uuid:rescuer_pk>/contacts/",           EmergencyContactListCreateView.as_view(), name="emergency-contact-list"),
    path("rescuers/<uuid:rescuer_pk>/contacts/<uuid:pk>/", EmergencyContactDetailView.as_view(),     name="emergency-contact-detail"),
]