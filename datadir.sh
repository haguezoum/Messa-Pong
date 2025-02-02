if [ ! -d "/home/$USER/data" ]; then
	echo "Creating directories..."

	mkdir -p "/home/$USER/data/database"

    	echo "Directories created successfully!"
else
	echo "The directory '/home/$USER/data' already exists."
fi
