from django.core.exceptions import ValidationError
from zxcvbn import zxcvbn

class ZxcvbnValidator:
    def validate(self, password, user=None):
        result = zxcvbn(password)
        if result['score'] < 3:
            raise ValidationError(
                "Password too weak. Use a stronger combination of characters"
            )

    def get_help_text(self):
        return "Password must have a zxcvbn score of at least 3"
