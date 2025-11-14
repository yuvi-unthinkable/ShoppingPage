📦 Product Listing App (React Native + SQLite)

A fully offline-first Product Listing & Cart Management application built with React Native, SQLite, React Navigation, Context API, and local file storage.
Users can sign up, log in, add products with images, filter and search products, add to wishlist/cart, manage quantities, and complete checkout.

🚀 Features
🔐 Authentication System

User signup with validation

Login with SQLite credentials

Duplicate email prevention

Session persistence using AsyncStorage

Context API for global user state

Logout using navigation.replace()

📦 Product Management

Add products with:

Name

Description

Price

Available quantity

Rating

Image (via camera or gallery)

SQLite-based CRUD

Delete product with image cleanup

Pagination (7 items per page)

Search (debounced: 2 seconds)

Filters:

Price range

Minimum rating

Product detail screen

Image fallback if no image exists

MultiSlider for interactive filters

🛒 Cart & Wishlist

Add/remove from cart

Add/remove wishlist

Quantity update for each item

Quantity limits based on available stock

Total price calculation

Remove individual items

Checkout flow:

Deduct stock

Clear cart

Success message

🖼 Image Handling

Camera + Gallery support

Permissions for iOS & Android

Local file storage using RNFS

Handles file:// and content:// URIs

Fallback to base64 read/write

Auto-delete images when product is removed

📱 UI/UX Enhancements

LayoutAnimation for filter collapsible section

Pull-to-refresh on lists

KeyboardAvoidingView in forms

Floating Action Button (FAB)

Pagination UI

Clean card-based layout with rating & price

Empty-state components

Smooth navigation across screens

🗄 SQLite & Local Storage

Tables included:

users

products

cart (wishlist + cart flags + quantity)

Queries used:

CRUD operations

JOIN for cart

LIKE for search

LIMIT + OFFSET for pagination

BETWEEN for filters

Ordered queries

🛠 Tech Stack
Frontend

React Native

TypeScript / JavaScript

Context API

Database

SQLite (react-native-quick-sqlite)

Storage & Device APIs

React Native FS (RNFS)

React Native Image Picker

React Native Permissions

Navigation

@react-navigation/native

@react-navigation/native-stack

📂 Project Structure
src/
 ├── database/
 │    ├── db.ts
 │    ├── productService.ts
 │    ├── cartServices.ts
 │    ├── userServices.ts
 │
 ├── screens/
 │    ├── Login.tsx
 │    ├── Signup.tsx
 │    ├── ProductListScreen.tsx
 │    ├── AddProductScreen.tsx
 │    ├── CartList.tsx
 │    ├── Wishlist.tsx
 │    ├── ProductDetailScreen.tsx
 │
 ├── context/
 │    ├── UserContext.tsx
 │
 ├── utils/
 │    ├── fileHelper.ts
 │    ├── Permissions.ts
 │
 ├── navigators/
 │    ├── type.ts
 │
 App.tsx

📸 Screenshots

(Add your images here)

/screenshots
├── login.png
├── signup.png
├── product-list.png
├── add-product.png
├── cart.png
├── wishlist.png

▶️ Installation
1️⃣ Clone the repository:
git clone your-repo-url
cd your-app

2️⃣ Install dependencies:
npm install

3️⃣ iOS setup:
cd ios && pod install && cd ..
npx react-native run-ios

4️⃣ Android setup:
npx react-native run-android

🔧 Environment Requirements

Node.js

React Native CLI

Android Studio / Xcode

iOS 13+ / Android 6+

Physical device recommended for camera testing

🧪 Testing the App

Create an account

Login

Add multiple products with images

Search & filter

Add items to wishlist

Add to cart

Update quantity (bounded by stock)

Checkout and see stock reduce

📐 Architecture Decisions

Service-layer architecture keeps UI clean

SQLite chosen over realm/watermelonDB for simplicity

RNFS + app storage ensures images persist offline

Context API manages global user state

React Navigation separates stacks cleanly

Debounce reduces DB load

Parameterized queries prevent SQL injection

JOIN queries used for cart → product mapping

🛡 Security Considerations

SQL Injection prevention via parameterized queries

Passwords stored as plain text in local DB (acceptable for demo apps, but hashing is recommended)

Permission handling follows platform best practices

🔮 Future Enhancements

Product categories

API integration

Image compression & caching

Dark mode

Fingerprint login

Redux Toolkit instead of Context

Transaction wrapping for checkout

Improved UI animations

🤝 Contributions

Feel free to fork this project, raise issues, or submit pull requests!

📄 License

MIT License
