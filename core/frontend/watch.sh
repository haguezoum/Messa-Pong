#!/bin/sh

notify_changes(){
	echo "Changes Are detected, updating the /www"
}

inotifywait -mrq -e modify,create,delete,move /www | while read -r event; do
	notify_changes
done
