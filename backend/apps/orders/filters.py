import django_filters
from .models import Order


class OrderFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr="icontains")
    surname = django_filters.CharFilter(lookup_expr="icontains")
    email = django_filters.CharFilter(lookup_expr="icontains")
    phone = django_filters.CharFilter(lookup_expr="icontains")
    status = django_filters.CharFilter(lookup_expr="exact")
    course = django_filters.CharFilter(lookup_expr="exact")
    course_format = django_filters.CharFilter(lookup_expr="exact")
    course_type = django_filters.CharFilter(lookup_expr="exact")
    age = django_filters.NumberFilter(field_name="age", lookup_expr="exact")
    group = django_filters.CharFilter(field_name="group__name", lookup_expr="icontains")

    start_date = django_filters.DateFilter(
        field_name="created_at", lookup_expr="gte"
    )
    end_date = django_filters.DateFilter(
        field_name="created_at", lookup_expr="lte"
    )
    created_at = django_filters.DateFromToRangeFilter()

    class Meta:
        model = Order
        fields = [
            "name",
            "surname",
            "email",
            "phone",
            "status",
            "course",
            "course_format",
            "course_type",
            "age",
            "group",
            "start_date",
            "end_date",
            "created_at",
        ]
