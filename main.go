package main

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Session struct {
	clients map[*websocket.Conn]bool
	mu      sync.Mutex
}

var session = Session{
	clients: make(map[*websocket.Conn]bool),
}

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

	session.mu.Lock()
	session.clients[conn] = true
	session.mu.Unlock()

	defer func() {
		session.mu.Lock()
		delete(session.clients, conn)
		session.mu.Unlock()
	}()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Error while reading messages from client", err)
			break
		}

		fmt.Println(message)
		broadcast(message)

	}
}

func broadcast(message []byte) {
	session.mu.Lock()
	defer session.mu.Unlock()

	for client := range session.clients {
		err := client.WriteMessage(websocket.TextMessage, message)

		if err != nil {
			fmt.Println("Error while sending message to clients", err)
			client.Close()
			delete(session.clients, client)
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
