# SAFEwalk Mobile App

A mobile app for the University of Wisconsin's SAFEwalk service on campus.

## Background

This app is submission for University of Wisconsin-Madison's CS 506 - Software Engineering for Spring 2020 semester. Teammates are [Katie Bajkowski](https://github.com/Bajkowski), [Alex Deuman](https://github.com/adeuman), [Yoon Cho](https://github.com/yoon172), [Tadao Shimura](https://github.com/tshimura10), [Justin Tan](https://github.com/justinztan11) and [Mujahid Anuar](https://github.com/mujahidfa). At the time of the submission, all are students at the University of Wisconsin-Madison.

## Installation

In order to run on your machine, you will need to run two applications on 2 separate command lines. Here's how you would do it:

### Backend setup:

1. Clone the SAFEwalk-backend [repo](https://github.com/justinztan11/SAFEwalk-backend):

```sh
git clone https://github.com/justinztan11/SAFEwalk-backend
```

2. Checkout the [iteration-3](https://github.com/justinztan11/SAFEwalk-backend/tree/iteration-3) branch:

```sh
git checkout iteration-3
```

3. Make sure to have `node` and `yarn`/`npm` installed.

4. Install `nodemon` globally:

```sh
npm install -g nodemon
```

5. Install packages:

```sh
yarn # or npm install
```

6. Run the backend:

```sh
nodemon index.js
```

### Frontend setup (i.e. setting up the mobile app):

1. Clone this repo on your machine:

```sh
git clone https://github.com/mujahidfa/SAFEwalk-mobile
```

2. Checkout the `iteration-3` branch:

```sh
git checkout iteration-3
```

3. Install the [Expo CLI](https://docs.expo.io/workflow/expo-cli/) globally

```sh
npm install -g expo-cli
```

4. Install packages:

```sh
yarn # or npm install
```

5. Go to `/contexts/socket.js` and change the IP address according to your local IP address.

6. Finally, run the app:

```sh
expo start #or yarn start
```

7. Scan Expo QR Code through the Expo App (or run on an Android/ios emulator).

### Tests

To run tests, enter the following command:

```sh
yarn test
```
