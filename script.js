window.onload = () => {

  setTimeout(() => {
    document.querySelector(".luz").style.opacity = 1;
  }, 500);

  setTimeout(() => {
    document.querySelector(".doctora").style.transform = "translateY(0)";
  }, 1500);

  setTimeout(() => {
    document.querySelector(".nino").style.transform = "translateX(0)";
  }, 2200);

  setTimeout(() => {
    document.querySelector(".mama").style.transform = "translateX(0)";
  }, 2600);

  setTimeout(() => {
    document.querySelector(".globo").style.opacity = 1;
    document.querySelector(".globo").style.transform = "translateY(0)";
  }, 3000);

  setTimeout(() => {
    document.querySelector(".risa").style.opacity = 1;
    document.querySelector(".risa").style.transform = "scale(1)";
  }, 3500);

};
