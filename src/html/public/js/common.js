const headerPlaceHolder = document.getElementById("header-placeholder");
const footerPlaceHolder = document.getElementById("footer-placeholder");

(async () => {
  const footerRes = await fetch("/components/footer.html");
  const footerHtml = await footerRes.text();
  footerPlaceHolder.innerHTML = footerHtml;

  const headerRes = await fetch("/components/header.html");
  const headerHtml = await headerRes.text();
  headerPlaceHolder.innerHTML = headerHtml;

  const button = document.querySelector("nav > button");
  button.addEventListener("click", () => {
    ul = document.querySelector("nav > ul");
    ul.classList.toggle("active");
    button.classList.add("hidden");
  });

  const adminFetch = await fetch("/admin");
  const isAdmin = adminFetch?.status === 200;
  console.log("Is user status code is: ", adminFetch.status);

  const user = await fetch("/api/user/me");
  const isUser = user.status === 200;
  console.log("Is user status code is: ", user.status);

  const logoutNavLink = document.getElementById("logout-link");
  logoutNavLink.firstElementChild.addEventListener("click", async () => {
    const res = await fetch("/api/user/logout");
    if (res.status === 200) {
      window.location.href = "/";
    }
  });

  if (isUser) {
    const loginNavLink = document.getElementById("login-link");
    loginNavLink.classList.add("hidden");

    const registerNavLink = document.getElementById("register-link");
    registerNavLink.classList.add("hidden");

    logoutNavLink.classList.remove("hidden");

    const cartNavLink = document.getElementById("cart-link");
    cartNavLink.classList.remove("hidden");

    const addressNavLink = document.getElementById("address-link");
    addressNavLink.classList.remove("hidden");

    const historyLink = document.getElementById("history-link");
    historyLink.classList.remove("hidden");

    if (isAdmin) {
      const adminNavLink = document.getElementById("admin-link");
      adminNavLink.classList.remove("hidden");
    }
  }
})();
