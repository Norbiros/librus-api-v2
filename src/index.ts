import axios, { AxiosInstance, AxiosResponse } from "axios";
import  { wrapper } from "axios-cookiejar-support"
import { CookieJar } from "tough-cookie"

export class Librus {
  private readonly cookie: CookieJar;
  private readonly caller: AxiosInstance;

  constructor() {
    this.cookie = new CookieJar();
    this.cookie.setCookie("TestCookie=1;", "https://synergia.librus.pl")
    this.caller = wrapper(
      axios.create({
        jar: this.cookie,
        withCredentials: true,
        headers: {
          "User-Agent":
            "User-Agent:Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.73 Safari/537.36",
        },
      })
    );
  }

  authorize(login: string, pass: string): Promise<boolean> {
    let caller = this.caller;
    return caller
      .get(
        "https://api.librus.pl/OAuth/Authorization?client_id=46&response_type=code&scope=mydata"
      )
      .then(() => {
        return caller.postForm(
          "https://api.librus.pl/OAuth/Authorization?client_id=46",
          {
            action: "login",
            login: login,
            pass: pass,
          }
        );
      })
      .then(() => {
        return caller
          .get("https://api.librus.pl/OAuth/Authorization/2FA?client_id=46")
          .then(() => {
            return true;
          });
      })
      .catch((e: Promise<boolean>) => {
        console.error(e);
        return false;
      });
  }

  getUsers() {
    return this.caller
      .get("https://synergia.librus.pl/gateway/api/2.0/Users")
      .then((el: AxiosResponse<any>) => {
        return el.data.Users;
      })
      .catch((e) => {
        console.error(e);
        return []
      });
  }
}