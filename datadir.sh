if [ ! -d "/home/$USER/data" ]; then
	echo "Creating directories..."

	mkdir -p "/home/$USER/data/database"
	mkdir -p "/home/$USER/data/redis"
	mkdir -p "/home/$USER/data/frontend_files"
	mkdir -p "/home/$USER/data/auth_storage"

    	echo "Directories created successfully!"
else
	echo "The directory '/home/$USER/data' already exists."
fi
