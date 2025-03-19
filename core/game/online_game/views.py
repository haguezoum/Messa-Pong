from django.shortcuts import render

# Create your views here.
def game_view(request):
    """View for the game page"""
    return render(request, 'index.html')

