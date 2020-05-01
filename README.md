# SAFEwalk Mobile App

A mobile app for the University of Wisconsin's SAFEwalk service on campus.

Required Repos:
UI - https://github.com/mujahidfa/SAFEwalk-mobile
APIs - https://github.com/justinztan11/SAFEwalkAPI
Socket Server - https://github.com/justinztan11/SAFEwalk-backend

NOTE: This repository only contain the UI, database is deployed to Azure

## Background
The safety of our students and our faculty is paramount. With Safewalk, a free walking companionship service, students and staff can safely get from one place to another. However, currently to schedule a Safewalk, users must call or text a phone number to speak with a dispatcher. The dispatcher has to first determine eligibility for a Safewalk by getting information manually, including one’s name, phone number, and location before dispatching a team over. This cumbersome exchange of information can often take over a minute. That long minute is especially concerning when considering that someone requiring a Safewalk may be in immediate need of it. Furthermore, the time and personnel to receive the calls are also costly. The current solution is just not scalable and efficient enough when time is a factor of safety.

This application will automate the scheduling process. Users will be able to schedule Safewalks with very little latency as the middle men, the dispatcher, is removed from the process, and most eligibility and security checks will be done upon initial account creation. This will cut down scheduling time to under ten seconds. With the use of live geolocation tracking of the other party and messaging, there will also be better transparency and communication between users and Safewalkers. 

## Features
Users can:
- Choose walk start location and  destination
- Add requests
- Track live location of SAFEwalker
- See ETA of SAFEwalker to user location
- Create account & update profile 

Safewalkers can:
- View walk requests ordered by time
- Accept/Deny/Cancel walk request
- Update Profile

## Screens
![SAFEwalk App Flow](https://github.com/mujahidfa/SAFEwalk-mobile/blob/master/flowpic.JPG)

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

## Disclaimer

This app is submission for University of Wisconsin-Madison's CS 506 - Software Engineering for Spring 2020 semester. Teammates are [Katie Bajkowski](https://github.com/Bajkowski), [Alex Deuman](https://github.com/adeuman), [Yoon Cho](https://github.com/yoon172), [Tadao Shimura](https://github.com/tshimura10), [Justin Tan](https://github.com/justinztan11) and [Mujahid Anuar](https://github.com/mujahidfa). At the time of the submission, all are students at the University of Wisconsin-Madison.
