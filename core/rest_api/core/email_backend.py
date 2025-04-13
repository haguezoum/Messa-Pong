from django.core.mail.backends.smtp import EmailBackend as DefaultEmailBackend

class CustomEmailBackend(DefaultEmailBackend):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.timeout = 30
