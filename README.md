# Steam Library Checker

This webapp helps you find steam games to play with your friends by showing you what games every one of you owns. 

This is a somewhat old project of mine, but I decided to polish the UI a bit and make it public. (Don't expect any breathtaking usage of web technologies.)

### Trying it out

Check it out at [steamchecker.adriansteffan.tech/](https://steamchecker.adriansteffan.tech/)

## Prerequisites

There are a few requirements if you wish to self host this app yourself:

1. You will need a recent verion of [node.js](https://nodejs.org/en/download/).
2. You need to aquire a personal [Steam API Key](https://steamcommunity.com/dev/apikey).

## Installing

1. Clone this project and cd into the root directory.
2. Run
    ```
        npm install
    ```
3. Specify your desired PORT and HOST in the ```/public/config.js``` file. 
4. Create a .env file in the root directory with the following content:
    ```
    API=YOUR_STEAM_API_KEY_GOES_HERE 
    ```

You can now run the app from the root directory with
```
node main.js
```
 
  

## Authors

* **Adrian Steffan**   [adriansteffan](https://github.com/adriansteffan)

