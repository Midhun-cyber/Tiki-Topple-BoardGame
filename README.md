# 🏝️ Tiki Topple – Totem Dominion

An interactive **web-based strategic board game** inspired by the classic **Tiki Topple**, built using **HTML, CSS, and Vanilla JavaScript**.

This project transforms the traditional tabletop experience into a modern digital game with **immersive animations, AI gameplay, sound effects, dark mode, and responsive design**.

---

## 🎮 Game Overview

**Tiki Topple – Totem Dominion** is a strategy board game where players use special action cards to manipulate the position of Tikis in a stacked totem.

The main objective is to secretly move your assigned Tikis to the top positions before the round ends.

Players must use smart moves, prediction, and strategy to outplay opponents.

---

## ✨ Features

### 🎯 Core Gameplay

* 👥 Supports **2–4 player multiplayer**
* 🤖 **Single-player AI mode**
* 🎴 Card-based strategic moves
* 🗿 Dynamic totem stack manipulation
* 🏆 End-game score calculation
* 🎯 Secret objective Tikis

### 🎨 UI / UX Features

* 🌙 Dark mode / Light mode toggle
* ✨ Smooth animations
* 💥 Particle effects
* 🔊 Interactive sound effects
* 📱 Fully responsive layout
* 🌿 Attractive woodland tribal theme

### ⚙️ Advanced Features

* 💾 Local storage for player names
* 🎵 Web Audio API integration
* 🧠 AI turn automation
* 🎮 Real-time DOM updates
* 📊 Round progress tracker
* 🏅 Winner ranking overlay

---

## 🛠️ Tech Stack

* **HTML5**
* **CSS3**
* **JavaScript (Vanilla JS)**
* **Web Audio API**
* **Local Storage**
* **DOM Manipulation**
* **CSS Animations**

---

## 📂 Project Structure

```bash
Tiki-Topple-Game/
│
├── index.html      # Main game UI structure
├── style.css       # Styling, animations, dark mode
├── script.js       # Game logic and interactions
└── README.md
```

---

## 🧠 Game Logic

The game is based on **strategic card actions**.

Each player receives action cards:

* ⬆️ **UP 1**
* ⏫ **UP 2**
* 🚀 **UP 3**
* 💥 **TOPPLE**
* 💀 **TOAST**

These cards help manipulate the order of Tikis in the totem.

### Example

If a Tiki is in position 5 and a player uses **UP 2**, it moves to position 3.

The player’s hidden objective is to place their secret Tikis in:

* 👑 Top 1 → **9 points**
* 🥈 Top 2 → **5 points**
* 🥉 Top 3 → **2 points**

---

## 🤖 AI Mode

The project includes an **AI opponent**.

The AI:

* selects valid cards
* chooses optimal random moves
* avoids invalid first moves
* automatically performs actions

This adds a strong **game intelligence feature** to the project.

---

## 🎨 Special UI Features

### 🌙 Dark Mode

Users can switch between dark and light themes.

Theme preference is stored using **localStorage**.

### ✨ Animations

Includes:

* Tiki slide animations
* topple effect
* toast elimination effect
* particle bursts
* splash effects

### 🔊 Audio

Sound effects are generated using **Web Audio API** for:

* card selection
* movement
* elimination
* winning

---

## 🚀 How to Run

### Method 1 — Direct Run

Simply open:

```bash
index.html
```

in any browser.

### Method 2 — VS Code Live Server

Recommended:

1. Open project folder in VS Code
2. Install **Live Server**
3. Right click `index.html`
4. Click **Open with Live Server**

---

## 📸 Screenshots

### Welcome Screen

<img width="1818" height="959" alt="image" src="https://github.com/user-attachments/assets/8491a406-9e6f-46dc-ab2b-c0ff57e99721" />

### Gameplay Screen

<img width="1828" height="970" alt="image" src="https://github.com/user-attachments/assets/a377c768-100c-487a-ba6a-fae53f8a1eb3" />

### Dark Mode Screen
<img width="1800" height="964" alt="image" src="https://github.com/user-attachments/assets/39e14bcb-a405-4abf-bf6e-774bed54db01" />

### Winner Screen
<img width="1440" height="873" alt="image" src="https://github.com/user-attachments/assets/54454c37-1603-4efe-a51d-13a2a75ce517" />

---

## 🎯 Learning Outcomes

This project demonstrates:

* frontend development
* DOM manipulation
* game state management
* event handling
* AI logic
* responsive design
* CSS animation
* browser storage
* audio programming

---

## 💼 Resume Value

This is a strong **portfolio-level frontend + game development project**.

Best suited for:

* hackathons
* resume projects
* GitHub showcase
* frontend developer portfolio

---

## 👨‍💻 Author

**Midhun V S**,
B.Tech CSE (Data Science with ML)
Lovely Professional University

---
