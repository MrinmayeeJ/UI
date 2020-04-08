import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

/**
 * Declares the WebChat property on the window object.
 */
declare global {
    interface Window {
        WebChat: any;
    }
}

window.WebChat = window.WebChat || {};

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    public isButtonVisible = true;
    public isModelVisible = false;
    @ViewChild('botWindow') botWindowElement: ElementRef;

    public ngOnInit(): void {

    }
    onClick() {
         this.isButtonVisible = false;
         this.isModelVisible = true;
         const directLine = window.WebChat.createDirectLine({
            secret: 'r9Ean8uiqZw.nKo3xuCUvIOM81MDCn4j6of0MFmXWosSTIdScAyUGtw',
            webSocket: false
             //AEc_1KKlNPA.sWxtdyUW09D1AHMTFV7z-MLTpiRgva0gAhBnZeh5I0o --new
             //OWZCxOiEOiA.cwA.IYU.DyvReSnYC0zXlCVgswYKaD-Fcp9la8Fm1YNPS-QI-w8 --original
        });


         window.WebChat.renderWebChat(
            {
                directLine,
                userID: 'USER_ID'
            },
            this.botWindowElement.nativeElement
        );

         directLine
            .postActivity({
                from: { id: 'USER_ID', name: 'USER_NAME' },
                name: 'requestWelcomeDialog',
                type: 'event',
                value: 'token'
            })
            .subscribe(
                (id: any) => console.log(`Posted activity, assigned ID ${id}`),
                (error: any) => console.log(`Error posting activity ${error}`)
            );
    }
    onClose($event) {
        this.isModelVisible = false;
        location.reload();
     }

     onMinimize($event) {
     this.isModelVisible = false;
     location.reload();
     }


     getUrl() {
        return 'url(\'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTw4E7nOUA1z6PyBPIKwPqdB5f5q7n8z_KhmP0BH4BWX3K_WNbA&amp;s\')';
     }


    //  getImg() {
    //     return 'url(\'https://c8.alamy.com/comp/JFB13G/smartphone-with-lock-and-hand-drawn-cyber-security-related-objects-JFB13G.jpg;s\')';
    //  }
    }

 //<!--New code added from here for speech to text-->



            // Create a function to fetch the Cognitive Services Speech Services credentials.
            // The async function created will hold expiration information about the token and will return cached token when possible.
            function createFetchSpeechServicesCredentials() {
              let expireAfter = 0;
              let lastPromise;

              return () => {
                const now = Date.now();

                // Fetch a new token if the existing one is expiring.
                // The following article mentioned the token is only valid for 10 minutes.
                // We will invalidate the token after 5 minutes.
                // https://docs.microsoft.com/en-us/azure/cognitive-services/authentication#authenticate-with-an-authentication-token
                if (now > expireAfter) {
                  expireAfter = now + 300000;
                  lastPromise = fetch('https://webchat-mockbot.azurewebsites.net/speechservices/token', {
                    method: 'POST'
                  }).then(
                    res => res.json(),
                    err => {
                      expireAfter = 0;

                      return Promise.reject(err);
                    }
                  );
                }

                return lastPromise;
              };
            }

            const fetchSpeechServicesCredentials = createFetchSpeechServicesCredentials();

            (async function() {
              // In this demo, we are using Direct Line token from MockBot.
              // Your client code must provide either a secret or a token to talk to your bot.
              // Tokens are more secure. To learn about the differences between secrets and tokens
              // and to understand the risks associated with using secrets, visit https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0

            /*  const directLineTokenRes = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', {
                method: 'POST'
              });

              const { token } = await directLineTokenRes.json();
             */
             //const { token } = "ULIwMuQMFh0.IzWPcCJanmR5lQBYkk6bqo6b3xHFuDCR8LpI4k31IBc";

                 const cres =await fetch('https://directline.botframework.com/v3/directline/tokens/generate',{
                 headers:{
                 authorization:'Bearer r9Ean8uiqZw.nKo3xuCUvIOM81MDCn4j6of0MFmXWosSTIdScAyUGtw'},
                 method : 'POST'
                 });

                 const { token } = await cres.json();

              // We are creating a ponyfill factory that will only return speech recognition part.
              async function createSpeechRecognitionOnlyPonyfillFactory() {
                // Create the ponyfill factory function, which can be called to create a concrete implementation of the ponyfill.
                const speechServicesPonyfillFactory = await window.WebChat.createCognitiveServicesSpeechServicesPonyfillFactory(
                  {
                    // We are passing the Promise function to the "credentials" field.
                    // This function will be called every time the token is used.
                    credentials: fetchSpeechServicesCredentials,

                    // The following code is needed only for Web Chat < 4.8.
                    // Starting from 4.8, we will support the newer "credentials" option, which is preferred over "authorizationToken" and "region".
                    authorizationToken: () =>
                      fetchSpeechServicesCredentials().then(({ authorizationToken }) => authorizationToken),
                    region: fetchSpeechServicesCredentials().then(({ region }) => region)
                  }
                );

                return options => {
                  const speechServicesPonyfill = speechServicesPonyfillFactory(options);

                  // We are only returning the speech recognition part of the ponyfill, not the speech synthesis part.
                  return {
                    SpeechGrammarList: speechServicesPonyfill.SpeechGrammarList,
                    SpeechRecognition: speechServicesPonyfill.SpeechRecognition
                  };
                };
              }

              // Pass a Web Speech ponyfill factory to renderWebChat.
              // You can also use your own speech engine, given it is compliant to W3C Web Speech API: https://w3c.github.io/speech-api/.
              // For implementation, look at createBrowserWebSpeechPonyfill.js for details.
              window.WebChat.renderWebChat(
                {
                  directLine: window.WebChat.createDirectLine({ token }),
                  webSpeechPonyfillFactory: await createSpeechRecognitionOnlyPonyfillFactory()
                },
                document.getElementById('webchat')
              );

              const a = <HTMLElement>document.querySelector('#webchat > *');
              a.focus();

            })().catch(err => console.error(err));

    //<!--New code added till here for speech to text-->
