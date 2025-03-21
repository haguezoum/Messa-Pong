from    django.core.exceptions import ValidationError
import  re

class   CustomPasswordValidator:
    def __init__(self, min_length=7, max_length=30):
        self.min_length = min_length
        self.max_length = max_length

    def validate(self, password, user=None):
        if not password or len(password.strip()) == 0:
            raise ValidationError('Password is required.')
        if len(password) < self.min_length:
            raise ValidationError('Password is too short %d is required at least.' % self.min_length)
        if len(password) > self.max_length:
            raise ValidationError('Password is too long %d is required at most.' % self.max_length)
        if not re.findall('[a-z]', password):
            raise ValidationError('Password must contain at least one lowercase letter.')
        if not re.findall('[A-Z]', password):
            raise ValidationError('Password must contain at least one uppercase letter.')
        if not re.findall('[0-9]', password):
            raise ValidationError('Password must contain at least one digit.')
		if not re.findall('[!@#$%^&*(),.?":{}|<>_+=\-/\\\\]', password):
			raise ValidationError('Password must contain at least one special character.')

    def GetHelpText(self):
        return 'For strong password, Your password must contain at least one, lower-upper case letter, and one digit, and one special character [example: Test@Strong.Pass].'
