window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition || window.oSpeechRecognition;

//* Register the Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/eve/serviceWorker.js")
      .then((res) => console.log("service worker registered"))
      .catch((err) => console.log("service worker not registered", err));
  });
}

class MyApp {
  static global() {
    // UI
    MyApp.menu = document.querySelector("#settingsMenu li ul");
    MyApp.closeBtn = document.querySelector(".xBtn");
    MyApp.runBtn = document.getElementById("runBtn");
    MyApp.topLid = document.getElementById("topEyeLid");
    MyApp.bottomLid = document.getElementById("bottomEyeLid");
    // arrays
    MyApp.shutdownArr = ["see you tomorrow", "don't let the bed bugs bite", "sleep well", "goodnight"];
    MyApp.failArr = ["sorry, i didn't understand.", "sorry, i don't understand.", "sorry i didn't understand the question you have been asking", "i wasn't able to understand the question i heard", "i'm sorry, i didn't get what you said"];
    // response text
    MyApp.resText = "";
    // voice settings
    MyApp.volume = 1;
    MyApp.rate = 0.9;
    MyApp.pitch = 0.7;
    // settings containers
    MyApp.switchCon = document.querySelector(".generalLayer");
    MyApp.voiceCon = document.querySelector(".voiceLayer");
    // switch
    MyApp.timeToggle = true;
    MyApp.alarmToggle = true;
    MyApp.weatherToggle = true;
    MyApp.googleToggle = true;
    MyApp.wikiToggle = true;
    MyApp.requestToggle = true;
    MyApp.closeTabsToggle = true;
    MyApp.logOutToggle = true;
    // set alarm
    MyApp.alarmLoop = true;
    MyApp.alarmInterval;
    // connection
    MyApp.wentOffline;
    MyApp.wentOnline;
    // prayer time
    MyApp.prayerArr;
    MyApp.prayerChecker = true;
    MyApp.prayerToggle = true;
    MyApp.azanToggle = false;
    // other
    MyApp.tabs = [];
    MyApp.unknownQ = [];
    MyApp.shutdown = false;
    MyApp.isListening = false;
    MyApp.autoRestart = true;
    MyApp.mainToggle = false;
  }

  //* show settings
  static showSettings(e) {
    // select elements
    const container = document.getElementById("settingsPage");
    const layers = document.querySelectorAll(".settingsLayer");

    // all btns
    if (e.target.nodeName.toLowerCase() === "li") {
      // style body overflow
      document.body.style.overflow = "hidden";
      //! hide layers
      layers.forEach((layer) => (layer.style.display = "none"));
      //* show container
      container.style.display = "block";
    }
    // general btn
    if (e.target.classList.contains("generalBtn")) document.querySelector(".generalLayer").style.display = "block";
    // voice btn
    else if (e.target.classList.contains("voiceBtn")) document.querySelector(".voiceLayer").style.display = "block";
    // help btn
    else if (e.target.classList.contains("helpBtn")) document.querySelector(".helpLayer").style.display = "block";
  }

  //! hide settings
  static hideSettings(e) {
    if (e.target.classList.contains("closeLayerBtn")) {
      // style body overflow
      document.body.style.overflow = "auto";
      //! hide container
      document.getElementById("settingsPage").style.display = "none";
    }
  }

  // eye animation
  static eyeAnimation() {
    //! reset
    MyApp.topLid.className = "";
    MyApp.bottomLid.className = "";
    //* close
    MyApp.topLid.classList.add("closeTopEyeLid");
    MyApp.bottomLid.classList.add("closeBottomEyeLid");

    setTimeout(() => {
      //! reset
      MyApp.topLid.className = "";
      MyApp.bottomLid.className = "";
      // open
      MyApp.topLid.classList.add("openTopEyeLid");
      MyApp.bottomLid.classList.add("openBottomEyeLid");
    }, 200);
  }

  // get time
  static syncTime() {
    // select time container
    let timeCon = "";
    // get date
    const date = new Date();

    //! hours
    // am, pm basis
    const hArr = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const hours = date.getHours();
    const h = hArr[hours];
    let am_pm = "";

    // detect am, pm
    if (hours >= 12) {
      am_pm = ", PM";
    } else {
      am_pm = ", AM";
    }

    //! minutes
    const m = date.getMinutes();
    let mStr = "";
    if (m === 1) {
      mStr = `and, ${m} minute`;
    } else if (m > 1) {
      mStr = `and, ${m} minutes`;
    } else if (m === 0) {
      mStr = `, sharp`;
    }

    //* sync time
    timeCon = `it's ${h} ${mStr} ${am_pm}`;

    return timeCon;
  }

  // get date
  static syncDate() {
    let dateCon = "";
    // get date
    const date = new Date();

    //! month
    const mArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = date.getMonth();

    //! day
    const day = date.getDate();

    //* sync date
    dateCon = `it's ${mArr[month]}, ${day}`;

    return dateCon;
  }

  // set alarm
  static setAlarm(num, string) {
    //! reset
    MyApp.alarmLoop = true;

    //? get desired time
    let target = new Date().getTime() + num * 60000;

    //! clear
    if (MyApp.alarmInterval !== undefined) clearInterval(MyApp.alarmInterval);
    //* call fn
    MyApp.wakeUp(target, string);
  }

  // wake Up
  static wakeUp(target, string) {
    // counter fn
    const counter = () => {
      if (MyApp.alarmLoop) {
        const current = new Date().getTime();
        if (current >= target) {
          MyApp.alarmAudio(string);
          // die
          MyApp.alarmLoop = false;
        }
      }
    };
    // init
    MyApp.alarmInterval = setInterval(counter, 1000);
  }

  // alarm audio
  static alarmAudio(string) {
    if ("speechSynthesis" in window) {
      // speech
      const synth = window.speechSynthesis;
      const speech = new SpeechSynthesisUtterance(`wake up, ${string} passed`);
      // set voice
      speech.volume = MyApp.volume;
      speech.rate = MyApp.rate;
      speech.pitch = MyApp.pitch;
      // init speech
      synth.speak(speech);
    }
  }

  // prayer time
  static prayerAlarm(recog) {
    // select notify
    const notify = document.getElementById("notify");
    // get date
    const t = new Date();
    const d = t.getDate();
    const m = t.getMonth() + 1;
    const y = t.getFullYear();

    // user position (lat,lng)
    const getLocation = () => {
      if (navigator.geolocation && MyApp.prayerToggle) {
        navigator.geolocation.getCurrentPosition(success, error);
        // die
        MyApp.prayerToggle = false;
      } else if (!navigator.geolocation) alert("Geolocation is not supported by this browser.");
    };

    //* success
    const success = (position) => {
      // get position
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      // methods
      const method = 5;
      // Egyptian General Authority of Survey => 5
      // Islamic Society of North America => 2
      // University of Islamic Sciences, Karachi => 1
      // Muslim World League => 3
      // Umm al-Qura, Makkah => 4
      let url = `https://api.aladhan.com/v1/calendar?latitude=${lat}&longitude=${lng}&method=${method}&month=${m}&year=${y}`;

      // fetch api
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          const obj = data.data[d - 1].timings;

          let fajr = obj.Fajr.replace(/\D/gi, "");
          let dhuhr = obj.Dhuhr.replace(/\D/gi, "");
          let asr = obj.Asr.replace(/\D/gi, "");
          let maghrib = obj.Maghrib.replace(/\D/gi, "");
          let isha = obj.Isha.replace(/\D/gi, "");

          MyApp.prayerArr = [
            { h: +fajr.slice(0, 2), m: +fajr.slice(2), prayer: "fajr" },
            { h: +dhuhr.slice(0, 2), m: +dhuhr.slice(2), prayer: "dhuhr" },
            { h: +asr.slice(0, 2), m: +asr.slice(2), prayer: "asr" },
            { h: +maghrib.slice(0, 2), m: +maghrib.slice(2), prayer: "maghrib" },
            { h: +isha.slice(0, 2), m: +isha.slice(2), prayer: "isha" },
          ];

          const getH = () => new Date().getHours();
          const getM = () => new Date().getMinutes();
          let string;

          //! prayer checker
          setInterval(() => {
            if (MyApp.prayerChecker) {
              console.log("Prayer Checker");

              MyApp.prayerArr.forEach((item) => {
                //* if matched prayer time or passed by 1 minute
                if (item.h == getH() && (item.m == getM() || getM() - item.m == 1 || getM() - item.m == 2)) {
                  string = item.prayer;
                  MyApp.azanToggle = true;
                  // die
                  MyApp.prayerChecker = false;
                }
              });
            }
          }, 1000);

          //* azan
          const initAzan = () => {
            if ("speechSynthesis" in window) {
              // stop recognition
              recog.abort();
              // die
              MyApp.shutdown = true;
              MyApp.mainToggle = false;

              // notify
              notify.innerHTML = `It's ${string} prayer time`;
              notify.style.backgroundColor = "#25b869";
              notify.style.display = "block";
              // hide notify
              setTimeout(() => {
                notify.style.display = "none";
                // reset color to red
                notify.style.backgroundColor = "#d81d2f";
              }, 5000);

              // speech
              const synth = window.speechSynthesis;
              const speech = new SpeechSynthesisUtterance(`it's ${string} prayer time`);
              // set voice
              speech.volume = MyApp.volume;
              speech.rate = MyApp.rate;
              speech.pitch = MyApp.pitch;
              // init speech
              synth.speak(speech);
            }

            // play azan
            setTimeout(() => {
              const azan = new Audio("/eve/sounds/azan.mp3");
              azan.play();

              // re-init recognition after azan ends
              setTimeout(() => {
                MyApp.mainToggle = true;
                MyApp.runBtn.click();
              }, 2.5 * 60 * 1000);
            }, 3000);
          };

          setInterval(() => {
            if (MyApp.azanToggle) {
              console.log("Azan Time");
              initAzan();
              // init prayer checker after 30 minutes
              setTimeout(() => (MyApp.prayerChecker = true), 30 * 60 * 1000);
              // die
              MyApp.azanToggle = false;
            }
          }, 1000);
        })
        .catch((err) => console.log("Couldn't Fetch Prayer Time."));
    };

    //! error
    const error = (err) => {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          notify.innerHTML = `User denied the request for Geolocation.`;
          notify.style.display = "block";
          setTimeout(() => (notify.style.display = "none"), 5000);
          break;
        case err.POSITION_UNAVAILABLE:
          notify.innerHTML = `Location information is unavailable.`;
          notify.style.display = "block";
          setTimeout(() => (notify.style.display = "none"), 5000);
          break;
        case err.TIMEOUT:
          notify.innerHTML = `The request to get user location timed out.`;
          notify.style.display = "block";
          setTimeout(() => (notify.style.display = "none"), 5000);
          break;
        case err.UNKNOWN_ERROR:
          notify.innerHTML = `An unknown error occurred.`;
          notify.style.display = "block";
          setTimeout(() => (notify.style.display = "none"), 5000);
          break;
      }
    };

    // init
    getLocation();
  }

  //* fire assistant
  static fireAssistant(e) {
    //* fetch data
    fetch("/eve/data.json")
      .then((res) => res.json())
      .then((data) => {
        // play video
        document.querySelector("video").play();

        MyApp.mainToggle = true; // make sure user interacted with UI

        //* call fn
        MyApp.handleRecognition(data);
        //! set other stuff
        // reset toggle
        MyApp.shutdown = false;
        // select elements
        const btn = document.getElementById("runBtn");
        const robot = document.getElementById("robotCon");
        const eye = document.querySelectorAll(".eye");
        const chat = document.getElementById("chat");
        const section = document.querySelector("#chat section");

        // style elements
        btn.style.display = "none";
        robot.style.display = "block";
        if (section) {
          chat.style.marginTop = "50px";
        } else {
          chat.style.marginTop = "0px";
        }

        //! reset eyes color
        eye.forEach((elm) => (elm.style.filter = "grayscale(0)"));
        //! reset mic holder color
        document.getElementById("statusIcon").style.filter = "grayscale(0)";
      })
      .catch((err) => console.log(err));
  }

  // handle recognition
  static handleRecognition(data) {
    // select elements
    const status = document.getElementById("statusIcon");
    const mic = document.querySelector(".mic");
    const dots = document.querySelector(".dots");
    const notify = document.getElementById("notify");

    if ("SpeechRecognition" in window && "speechSynthesis" in window) {
      // mic
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      // recognition.interimResults = true;
      // max number of alternative transcripts
      recognition.maxAlternatives = 5;
      // recognition.continuous = true;
      // speaker
      const synth = window.speechSynthesis;
      const speech = new SpeechSynthesisUtterance();
      const voices = synth.getVoices();
      // set voice
      // speech.voice = voices[10]; // Note: some voices don't support altering params
      speech.voiceURI = "native";
      speech.lang = "en-US";
      speech.volume = MyApp.volume;
      speech.rate = MyApp.rate;
      speech.pitch = MyApp.pitch;

      //! events
      // start
      recognition.onstart = () => {
        MyApp.isListening = true;
        //* run bell
        const bell = new Audio("/eve/sounds/bell.mp3");
        bell.play();
        //! reset UI
        status.classList.remove("active");
        mic.classList.remove("active");
        dots.classList.remove("active");
        //* display relative icon
        status.classList.add("active");
        dots.classList.add("active");
      };
      // end
      recognition.onend = () => {
        MyApp.isListening = false;
        //! reset UI
        status.classList.remove("active");
        mic.classList.remove("active");
        dots.classList.remove("active");
        //* display relative icon
        status.classList.add("active");
        mic.classList.add("active");
      };
      // error
      recognition.onerror = (e) => {
        if (e.error == "not-allowed" || e.error == "service-not-allowed") {
          MyApp.autoRestart = false;
          //! display notify
          notify.innerHTML = `Recognition is not allowed! <br> Please refresh the page and enable the mic.`;
          notify.style.display = "block";
          setTimeout(() => (notify.style.display = "none"), 5000);
        }
      };
      // result
      recognition.onresult = (e) => MyApp.getResults(e, data, synth, speech, recognition);

      // init prayer
      MyApp.prayerAlarm(recognition);

      //
      //
      //

      //* loop recognition
      setInterval(() => {
        if (MyApp.autoRestart && navigator.onLine && !MyApp.shutdown) {
          if (!MyApp.isListening && !synth.speaking) {
            console.log("Recognition Started");
            recognition.abort();
            recognition.start();
          } else if (synth.speaking && MyApp.isListening) {
            console.log("Recognition Aborted");
            recognition.abort();
          } else if ((MyApp.isListening && !synth.speaking) || (synth.speaking && !MyApp.isListening)) {
            console.log("Return Nothing");
            return;
          }
        }
      }, 1000);
    } else {
      notify.innerHTML = `Your browser is not supported! <br> It's prefered to use the lastest version of google chrome.`;
      notify.style.display = "block";
      setTimeout(() => (notify.style.display = "none"), 5000);
    }

    //
    //
    //
  }

  // handle results
  static getResults(e, data, synth, speech, recognition) {
    // select elements
    const status = document.getElementById("statusIcon");
    const mic = document.querySelector(".mic");
    const dots = document.querySelector(".dots");
    const chat = document.getElementById("chat");

    // get spoken text
    const transcript = Array.from(e.results)
      .map((result) => result[0])
      .map((result) => result.transcript)
      .join("");

    //* if done recognition
    if (e.results[0].isFinal) {
      MyApp.isListening = false;
      //! reset UI
      status.classList.remove("active");
      mic.classList.remove("active");
      dots.classList.remove("active");
      //* display relative icon
      status.classList.add("active");
      mic.classList.add("active");

      //? style chat
      chat.style.marginTop = "50px";

      // create section
      const section = document.createElement("section");
      // append order to section
      section.innerHTML = `
                        <div class="order">
                          <div><img src="img/user.svg" alt="user"></div>
                          <div><span>${transcript}</span></div>
                        </div>
                        <div class="clearFix"></div>
                        `;

      // append section to chat
      chat.append(section);

      // call fn
      MyApp.processData(transcript.toLowerCase(), data, synth, speech, recognition, section);
    }
  }

  // process data
  static processData(text, data, synth, speech, recognition, section) {
    let myNum = 10;
    // select elements
    const chat = document.getElementById("chat");
    const notify = document.getElementById("notify");

    //? Order
    const ordersArr = data.orders.filter((elm) => {
      for (let i = 0; i < elm.keywords.length; i += 1) if (text === elm.keywords[i]) return elm;
    });
    //? Talk
    const talkArr = data.talk.filter((elm) => {
      for (let i = 0; i < elm.keywords.length; i += 1) if (text.includes(elm.keywords[i])) return elm;
    });

    //! check conditions | shutdown
    if (/^goodnight|good night/gi.test(text) && MyApp.logOutToggle) {
      // pause video
      document.querySelector("video").pause();

      // response
      MyApp.resText = MyApp.shutdownArr[Math.floor(Math.random() * MyApp.shutdownArr.length)];

      // stop recognition
      recognition.abort();

      //? stop robot eyes blinking
      //! reset eye lids
      MyApp.topLid.className = "";
      MyApp.bottomLid.className = "";
      // gray out eyes
      document.querySelectorAll(".eye").forEach((elm) => (elm.style.filter = "grayscale(1)"));
      // gray out mic holder
      document.getElementById("statusIcon").style.filter = "grayscale(1)";

      setTimeout(() => {
        //! hide robot
        document.getElementById("robotCon").style.display = "none";
        //* show btn
        document.getElementById("runBtn").style.display = "block";
      }, 2500);

      // die
      MyApp.shutdown = true;
    } else {
      // other than shutdown

      if (ordersArr.length) {
        // Order
        const link = ordersArr[0].response[0];
        MyApp.tabs.push(window.open(link, "_blank"));
        MyApp.resText = "done";
      } else if (talkArr.length) {
        // Talk
        MyApp.resText = talkArr[0].response[Math.floor(Math.random() * talkArr[0].response.length)];
      } else if (!talkArr.length && !ordersArr.length) {
        // no order or talk

        if (/^search\s+/i.test(text) && MyApp.googleToggle) {
          // google
          const term = text.replace(/^search\s+/i, "");
          MyApp.tabs.push(window.open(`https://www.google.com/search?q=${term}`, "_blank"));
          MyApp.resText = "here's what i found";
        } else if (/^request\s+/i.test(text) && MyApp.requestToggle) {
          // request http
          const term = text.replace(/^request|\s+/gi, "");
          MyApp.tabs.push(window.open(`http://${term}`, "_blank"));
          MyApp.resText = "done";
        } else if (/close all windows/gi.test(text) && MyApp.closeTabsToggle) {
          // close all windows
          MyApp.tabs.forEach((tab) => tab.close());
          MyApp.resText = "done";
        } else if (/close last window/gi.test(text) && MyApp.closeTabsToggle) {
          // close last window
          if (MyApp.tabs.length) {
            let lastTab = MyApp.tabs.length - 1;
            MyApp.tabs[lastTab].close();
            MyApp.tabs.splice(lastTab, 1);
          }
          MyApp.resText = "done";
        } else if (/what time/gi.test(text) && MyApp.timeToggle) {
          // time
          MyApp.resText = MyApp.syncTime();
        } else if (/today's date|today is date/gi.test(text) && MyApp.timeToggle) {
          // date
          MyApp.resText = MyApp.syncDate();
        } else if (/set alarm for\s+|set an alarm for\s+/i.test(text) && MyApp.alarmToggle) {
          // alarm
          const num = Number(text.replace(/\D/gi, ""));
          const m = num == 0 ? 5 : num;
          const string = m > 1 ? `${m} minutes` : `${m} minute`;
          MyApp.setAlarm(m, string);
          MyApp.resText = `alarm has been set for ${string}`;
        } else if (/^define\s+/i.test(text) && MyApp.wikiToggle) {
          //! wikipedia
          const term = text.replace(/^define\s+/i, "");
          //* fetch
          fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=10&srsearch=${term}`)
            .then((res) => res.json())
            .then((myData) => {
              // mark array of results
              const wikiArr = myData.query.search.map((elm) => `${elm.snippet.replace(/<[^>]*>|&nbsp;|&quot;/gi, "")}`);

              // get random result
              if (wikiArr.length) {
                MyApp.resText = wikiArr[Math.floor(Math.random() * wikiArr.length)];
                //* append & show response
                speech.text = MyApp.resText;
                //* speak
                synth.speak(speech);

                // create response
                const response = `
                      <div class="response">
                        <div><img src="img/eve.svg" alt="eve"></div>
                        <div><span>${MyApp.resText}</span></div>
                      </div>
                      `;
                // append response to section
                section.insertAdjacentHTML("beforeend", response);
                // scroll to bottom
                chat.scroll({
                  top: chat.scrollHeight,
                  left: 0,
                  behavior: "smooth",
                });
              } else {
                MyApp.resText = "iam sorry, i didn't find any results!";
                //* append & show response
                speech.text = MyApp.resText;
                //* speak
                synth.speak(speech);

                // create response
                const response = `
                      <div class="response">
                        <div><img src="img/eve.svg" alt="eve"></div>
                        <div><span>${MyApp.resText}</span></div>
                      </div>
                      `;
                // append response to section
                section.insertAdjacentHTML("beforeend", response);
                // scroll to bottom
                chat.scroll({
                  top: chat.scrollHeight,
                  left: 0,
                  behavior: "smooth",
                });
              }
            })
            .catch((err) => {
              MyApp.resText = "failed to fetch wikipedia";
              //* append & show response
              speech.text = MyApp.resText;
              //* speak
              synth.speak(speech);

              // create response
              const response = `
                      <div class="response">
                        <div><img src="img/eve.svg" alt="eve"></div>
                        <div><span>${MyApp.resText}</span></div>
                      </div>
                      `;
              // append response to section
              section.insertAdjacentHTML("beforeend", response);
              // scroll to bottom
              chat.scroll({
                top: chat.scrollHeight,
                left: 0,
                behavior: "smooth",
              });
            });
        } else if (/how is the weather|how's the weather|how is weather|how's weather/gi.test(text) && MyApp.weatherToggle) {
          //! weather
          const foo1 = [48, 57, 75, 51, 76, 114, 85, 90, 119, 10];
          const foo2 = [66, 85, 119, 10, 66, 84, 98, 88, 104, 85];
          const foo3 = [120, 88, 55, 109, 50, 48, 10, 65, 104, 76];
          const foo4 = [10, 49, 50, 105, 99, 78];
          const create = () => {
            let foo = [...foo1, ...foo2, ...foo3, ...foo4];
            foo.forEach((item, index, array) => {
              if (item === myNum) array.splice(index, 1);
            });
            return foo;
          };

          const in_ = (key) => {
            return new Promise((resolve, reject) => {
              let encoded = new Uint8Array(create());
              const ciphertext = window.crypto.subtle.encrypt(
                {
                  name: "RSA-OAEP",
                },
                key,
                encoded
              );
              resolve(ciphertext);
            });
          };

          const out_ = (key, ciphertext) => {
            return new Promise((resolve, reject) => {
              let decrypted = window.crypto.subtle.decrypt(
                {
                  name: "RSA-OAEP",
                },
                key,
                ciphertext
              );
              resolve(decrypted);
            });
          };

          window.crypto.subtle
            .generateKey(
              {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
              },
              true,
              ["encrypt", "decrypt"]
            )
            .then((res) => {
              in_(res.publicKey).then((ciphertext) => {
                out_(res.privateKey, ciphertext).then((decrypted) => {
                  const dec = new TextDecoder();

                  // user position (lat,lng)
                  const getLocation = () => {
                    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(success, error);
                    else alert("Geolocation is not supported by this browser.");
                  };
                  //* success
                  const success = (position) => {
                    // get position
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const unit = "si"; // si => Celsius, us => Fahrenheit
                    const clouds = "cloud_cover"; // clouds percentage
                    const type = "precipitation_type"; // ex: none, rain, snow, ice pellets, and freezing rain
                    const humidity = "humidity"; // Percent relative humidity from 0 - 100%
                    let url = `https://api.climacell.co/v3/weather/realtime?lat=${lat}&lon=${lon}&unit_system=${unit}&fields=temp%2C${humidity}%2C${type}%2C${clouds}`;

                    // fetch weather api
                    fetch(url, {
                      method: "GET",
                      headers: {
                        apikey: dec.decode(decrypted),
                      },
                    })
                      .then((res) => res.json())
                      .then((wData) => {
                        // temp
                        const tempUnit = /c/i.test(wData.temp.units) ? "Celsius" : "Fahrenheit";
                        const temp = `${Math.ceil(+wData.temp.value)} ${tempUnit}`;
                        // status
                        const status = /none/i.test(wData.precipitation_type.value) ? "" : ",there is " + wData.precipitation_type.value;
                        // humidity
                        const humidity = `${Math.ceil(+wData.humidity.value)}%`;
                        // clouds
                        const clouds = wData.cloud_cover.value == 0 ? "" : "and the sky is cloudy by " + Math.ceil(+wData.cloud_cover.value) + "%";

                        // get full weather info
                        MyApp.resText = `according to your location, the temperature is ${temp}, ${status} also the humidity is ${humidity} ${clouds}`;
                        //* append & show response
                        speech.text = MyApp.resText;
                        //* speak
                        synth.speak(speech);

                        // create response
                        const response = `
                      <div class="response">
                        <div><img src="img/eve.svg" alt="eve"></div>
                        <div><span>${MyApp.resText}</span></div>
                      </div>
                      `;
                        // append response to section
                        section.insertAdjacentHTML("beforeend", response);
                        // scroll to bottom
                        chat.scroll({
                          top: chat.scrollHeight,
                          left: 0,
                          behavior: "smooth",
                        });
                      })
                      .catch((err) => {
                        MyApp.resText = "failed to fetch the weather";
                        //* append & show response
                        speech.text = MyApp.resText;
                        //* speak
                        synth.speak(speech);

                        // create response
                        const response = `
                      <div class="response">
                        <div><img src="img/eve.svg" alt="eve"></div>
                        <div><span>${MyApp.resText}</span></div>
                      </div>
                      `;
                        // append response to section
                        section.insertAdjacentHTML("beforeend", response);
                        // scroll to bottom
                        chat.scroll({
                          top: chat.scrollHeight,
                          left: 0,
                          behavior: "smooth",
                        });
                      });
                  };
                  //! error
                  const error = (err) => {
                    switch (err.code) {
                      case err.PERMISSION_DENIED:
                        notify.innerHTML = `User denied the request for Geolocation.`;
                        notify.style.display = "block";
                        setTimeout(() => (notify.style.display = "none"), 5000);
                        break;
                      case err.POSITION_UNAVAILABLE:
                        notify.innerHTML = `Location information is unavailable.`;
                        notify.style.display = "block";
                        setTimeout(() => (notify.style.display = "none"), 5000);
                        break;
                      case err.TIMEOUT:
                        notify.innerHTML = `The request to get user location timed out.`;
                        notify.style.display = "block";
                        setTimeout(() => (notify.style.display = "none"), 5000);
                        break;
                      case err.UNKNOWN_ERROR:
                        notify.innerHTML = `An unknown error occurred.`;
                        notify.style.display = "block";
                        setTimeout(() => (notify.style.display = "none"), 5000);
                        break;
                    }
                  };
                  // init
                  getLocation();
                });
              });
            });
        } else {
          // default
          MyApp.resText = MyApp.failArr[Math.floor(Math.random() * MyApp.failArr.length)];
          //! check storage
          if (localStorage.getItem("ai") === null) MyApp.unknownQ = [];
          else MyApp.unknownQ = JSON.parse(localStorage.getItem("ai"));
          //* push undefined questions to array
          MyApp.unknownQ.push(text);
          //! remove duplication
          let arr = [...new Set(MyApp.unknownQ)];
          //! store undefined questions
          localStorage.setItem("ai", JSON.stringify(arr));
        }
      }
    }

    // if didn't fetch weather of wiki
    if (!/^define\s+/i.test(text) && !/how is the weather|how's the weather|how is weather|how's weather/gi.test(text)) {
      //! remove all emoji
      const regex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;
      const result = MyApp.resText.replace(regex, "");

      //* append & show response
      speech.text = result;
      //* speak
      synth.speak(speech);

      // create response
      const response = `
                      <div class="response">
                        <div><img src="img/eve.svg" alt="eve"></div>
                        <div><span>${MyApp.resText}</span></div>
                      </div>
                      `;
      // append response to section
      section.insertAdjacentHTML("beforeend", response);
      // scroll to bottom
      chat.scroll({
        top: chat.scrollHeight,
        left: 0,
        behavior: "smooth",
      });
    }
  }

  // handle network connection
  static connection(e) {
    // select element
    const notify = document.getElementById("notify");

    //! check offline status
    if (e.type == "offline") {
      // store current time
      MyApp.wentOffline = new Date().getTime();

      // display notify
      notify.innerHTML = `You lost connection.`;
      notify.style.display = "block";
    }

    //* check online status
    if (e.type == "online") {
      // store current time
      MyApp.wentOnline = new Date().getTime();

      // get lost time
      const lostTime = Math.round((MyApp.wentOnline - MyApp.wentOffline) / 1000);
      let string = lostTime >= 60 ? `${Math.round(lostTime / 60)} minutes!` : `${lostTime} seconds!`;

      // display notify
      notify.innerHTML = `You are online now <br> Connection lost for ${string}`;
      // add green color
      notify.style.backgroundColor = "#25b869";
      notify.style.display = "block";
      setTimeout(() => {
        notify.style.display = "none";
        // reset color to red
        notify.style.backgroundColor = "#d81d2f";
      }, 5000);
    }
  }

  // handle general switch
  static handleSwitch(e) {
    if (e.target.classList.contains("time-switch")) {
      // time switch
      if (e.target.checked) MyApp.timeToggle = true;
      else MyApp.timeToggle = false;
    } else if (e.target.classList.contains("alarm-switch")) {
      // alarm switch
      if (e.target.checked) MyApp.alarmToggle = true;
      else MyApp.alarmToggle = false;
    } else if (e.target.classList.contains("weather-switch")) {
      // weather switch
      if (e.target.checked) MyApp.weatherToggle = true;
      else MyApp.weatherToggle = false;
    } else if (e.target.classList.contains("google-switch")) {
      // google switch
      if (e.target.checked) MyApp.googleToggle = true;
      else MyApp.googleToggle = false;
    } else if (e.target.classList.contains("wiki-switch")) {
      // wiki switch
      if (e.target.checked) MyApp.wikiToggle = true;
      else MyApp.wikiToggle = false;
    } else if (e.target.classList.contains("request-switch")) {
      // request switch
      if (e.target.checked) MyApp.requestToggle = true;
      else MyApp.requestToggle = false;
    } else if (e.target.classList.contains("closeTabs-switch")) {
      // closeTabs switch
      if (e.target.checked) MyApp.closeTabsToggle = true;
      else MyApp.closeTabsToggle = false;
    } else if (e.target.classList.contains("logOut-switch")) {
      // logOut switch
      if (e.target.checked) MyApp.logOutToggle = true;
      else MyApp.logOutToggle = false;
    }
  }

  // handle voice
  static handleVoice(e) {
    const volNum = document.getElementById("volumeNum");
    const rateNum = document.getElementById("rateNum");
    const pitchNum = document.getElementById("pitchNum");
    const btn = document.getElementById("runBtn");
    let value = +e.target.value;

    //* sync
    if (e.target.classList.contains("volumeRange")) {
      MyApp.volume = value;
      volNum.textContent = value;
      btn.click();
    } else if (e.target.classList.contains("rateRange")) {
      MyApp.rate = value;
      rateNum.textContent = value;
      btn.click();
    } else if (e.target.classList.contains("pitchRange")) {
      MyApp.pitch = value;
      pitchNum.textContent = value;
      btn.click();
    }
  }
}

// init
MyApp.global();

//* loop animation
setInterval(() => {
  if (!MyApp.shutdown) MyApp.eyeAnimation();
}, 6000);

// ! EVENTS
// UI
//* show settings
MyApp.menu.addEventListener("click", MyApp.showSettings);
//! hide settings
MyApp.closeBtn.addEventListener("click", MyApp.hideSettings);

// API
//* run assistant
MyApp.runBtn.addEventListener("click", MyApp.fireAssistant);
// settings switch
MyApp.switchCon.addEventListener("click", MyApp.handleSwitch);
// change voice
// MyApp.voiceCon.addEventListener("change", MyApp.handleVoice);
// check connection
window.addEventListener("online", MyApp.connection);
window.addEventListener("offline", MyApp.connection);

//? restart if window blur of focus
window.addEventListener("blur", () => {
  // make sure user interacted with UI
  if (MyApp.mainToggle) window.focus();
});

window.addEventListener("focus", () => {
  if (MyApp.mainToggle) {
    // make sure user interacted with UI
    MyApp.autoRestart = true;
    MyApp.runBtn.click();
  }
});
