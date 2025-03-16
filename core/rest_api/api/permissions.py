from rest_framework import permissions

class IsVerifiedUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.verified

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.id == 1 