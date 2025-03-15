from django.shortcuts import render

def mode_selection(request):
    return render(request, 'modes/mode_selection.html')

def friend_mode(request):
    return render(request, 'local_game.html')

def ai_mode(request):
    return render(request, 'ai_game.html') 