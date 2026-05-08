// 씨티애드 포트폴리오 홈페이지의 인터랙션과 문의 폼을 관리하는 스크립트
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyy--S12P1KLEwtIa4AYoC0V__5cfAQ5Ij0b9Bg0sPPuWI-H2PfqyijHkjRMEtQJlJW6w/exec";

const form = document.querySelector("#leadForm");
const statusEl = document.querySelector("#formStatus");

if (window.lucide) {
  window.lucide.createIcons();
}

const revealConfigs = [
  { selector: ".section-title", direction: "up" },
  { selector: ".focus-grid article", direction: "up", stagger: 90 },
  { selector: ".service-card", direction: "up", stagger: 70 },
  { selector: ".seeding-copy", direction: "left" },
  { selector: ".seeding-panel", direction: "right" },
  { selector: ".global-visual", direction: "left" },
  { selector: ".global-copy", direction: "right" },
  { selector: ".video-card", direction: "up", stagger: 90 },
  { selector: ".expansion-image", direction: "left" },
  { selector: ".expansion-copy", direction: "right" },
  { selector: ".closing-profile", direction: "left" },
  { selector: ".closing-copy", direction: "right" },
  { selector: ".contact-copy", direction: "left" },
  { selector: ".lead-form", direction: "right" },
];

const revealTargets = [];

revealConfigs.forEach(({ selector, direction, stagger = 0 }) => {
  document.querySelectorAll(selector).forEach((target, index) => {
    target.classList.add("reveal-slide", `reveal-${direction}`);

    if (stagger > 0) {
      target.style.setProperty("--reveal-delay", `${index * stagger}ms`);
    }

    revealTargets.push(target);
  });
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 },
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

const placeSlider = document.querySelector(".place-slider");

if (placeSlider) {
  const slides = Array.from(placeSlider.querySelectorAll(".place-slide"));
  const dots = Array.from(placeSlider.querySelectorAll(".place-slider-dots button"));
  let currentSlide = 0;

  const showPlaceSlide = (nextIndex) => {
    currentSlide = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === currentSlide);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentSlide);
    });
  };

  let placeSliderTimer = window.setInterval(() => {
    showPlaceSlide(currentSlide + 1);
  }, 3600);

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      window.clearInterval(placeSliderTimer);
      showPlaceSlide(index);
      placeSliderTimer = window.setInterval(() => {
        showPlaceSlide(currentSlide + 1);
      }, 3600);
    });
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = {
    submittedAt: new Date().toISOString(),
    hospital: formData.get("hospital"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    department: formData.get("department"),
    service: formData.get("service"),
    budget: formData.get("budget"),
    message: formData.get("message"),
  };

  if (!GOOGLE_SCRIPT_URL) {
    statusEl.textContent = "구글시트 연동 주소가 아직 연결되지 않았습니다. 아래 setup 파일을 보고 연결해주세요.";
    console.info("문의 데이터 미리보기", payload);
    return;
  }

  statusEl.textContent = "문의 내용을 전송하고 있습니다.";

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload),
    });

    statusEl.textContent = "문의가 접수되었습니다. 빠르게 연락드리겠습니다.";
    form.reset();
  } catch (error) {
    statusEl.textContent = "전송 중 문제가 생겼습니다. 전화 또는 이메일로 연락 부탁드립니다.";
    console.error(error);
  }
});
