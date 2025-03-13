from django.shortcuts import render

def local_game(request):
    return render(request, 'local_game.html') 