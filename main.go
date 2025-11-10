package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func ws_handler(w http.ResponseWriter, r *http.Request) {
	// upgrade current connection to websocket connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Error while upgrading", err)
		return
	}

	defer conn.Close()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Error while reading messages from client", err)
			break
		}

		fmt.Println(message)
		if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
			fmt.Println("Error writing message:", err)
			break
		}

	}
}

func main() {
	http.HandleFunc("/", ws_handler)
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Print("error while trying to start the Server", err)
	}
}
