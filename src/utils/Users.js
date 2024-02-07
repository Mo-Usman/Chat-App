const users = []

// Function to add users
const addUser = ({ id, Username, Room }) => {
    Username = Username.trim().toLowerCase()
    Room = Room.trim().toLowerCase()

    // Checking if the credentials are provided
    if(!Username || !Room) {
        return {
            error: 'Username and Room are required!'
        }
    }

     // Check for existing credentials
     const existingValues = users.find((user) => {
        return user.Room === Room && user.Username === Username
    })

    // Validating the credentials
    if(existingValues) {
        return {
            error: 'Username is already in use!'
        }
    }

    const user = { id, Username, Room }
    users.push(user)
    return { user }
}

// Function to remove a user using their id
const removeUser = (id) => {
    const userIndex = users.findIndex((user) => user.id === id)
    if(userIndex !== -1) {
        return users.splice(userIndex, 1)[0]
    }
    
}

// Function to get a user a user using their id'
const getUser = (id) => {
    return users.find((user) => user.id===id)
}

// Function to get users in a room
const getRoomUsers = (room) => {
    const userRoom = room.trim().toLowerCase()
    return users.filter((user) => user.Room === userRoom)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getRoomUsers
}