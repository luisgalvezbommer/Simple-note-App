# How to

1. `npm init -y`
2. `npm install firebase`
3. Create a file named `src/index.js`
4. Get firebaseConfig from firebase console (Firebase Console --> Project settings --> Your Apps --> Web)
4. use firebaseConfig in your `index.js` file
5. install `webpack` etc. (`npm install webpack webpack-cli webpack-serve -D`)
6. remove `"type": "commonjs"` from package.json if exists
7. Add script to `package.json` "scripts" --> `"build": "webpack"`
8. Run `npm run build`
9. Run `firebase deploy` or `npx webpack serve`



## Notes
Only for localhost:
I don't need this when i use webpack to bundle my code. I only need this when i want to use firebase in a simple html file without any bundler.
```javascript
<!-- update the version number as needed -->
  <script defer src="/__/firebase/12.4.0/firebase-app-compat.js"></script>
  <!-- include only the Firebase features as you need -->
  <script defer src="/__/firebase/12.4.0/firebase-auth-compat.js"></script>
  <script defer src="/__/firebase/12.4.0/firebase-database-compat.js"></script>
  <script defer src="/__/firebase/12.4.0/firebase-firestore-compat.js"></script>
  <script defer src="/__/firebase/12.4.0/firebase-functions-compat.js"></script>
  <script defer src="/__/firebase/12.4.0/firebase-messaging-compat.js"></script>
  <script defer src="/__/firebase/12.4.0/firebase-storage-compat.js"></script>
  <script defer src="/__/firebase/12.4.0/firebase-analytics-compat.js"></script>
  <script defer src="/__/firebase/12.4.0/firebase-remote-config-compat.js"></script>
  <script defer src="/__/firebase/12.4.0/firebase-performance-compat.js"></script>
  <!-- 
      initialize the SDK after all desired features are loaded, set useEmulator to false
      to avoid connecting the SDK to running emulators.
    -->
  <script defer src="/__/firebase/init.js?useEmulator=true"></script>
  ```

  
  ## Else
  - Make your first Admin user
    - Set a secret in Firebase
        - `firebase functions:config:set admin.secret="Tevion89!"`
        - `firebase deploy --only functions`
    - Call the function via URL
        - `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/setAdminByEmail?email=luisgalvezbommer@gmail.com&secret=YOUR_SECRET_PASSWORD_HERE`
        - e.g. region=europe-west1, project_id=preparation-83dfb, email=lagb18071997@gmail.com, secret=Tevion89!
        - `https://europe-west1-preparation-83dfb.cloudfunctions.net/setAdminByEmail?email=lagb18071997@gmail.com&secret=Tevion89!`
