const headerPlaceHolder = document.getElementById("header-placeholder");
fetch("/components/header.html")
  .then((res) => {
    return res.text();
  })
  .then((html) => {
    headerPlaceHolder.innerHTML = html;

    const button = document.querySelector("nav > button");
    button.addEventListener("click", () => {
      ul = document.querySelector("nav > ul");
      ul.classList.toggle("active");
      button.classList.add("hidden");
    });
  });

const footerPlaceHolder = document.getElementById("footer-placeholder");
fetch("/components/footer.html")
  .then((res) => {
    return res.text();
  })
  .then((html) => {
    footerPlaceHolder.innerHTML = html;
  });
