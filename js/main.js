
document.addEventListener("DOMContentLoaded", function () {
  // Initialize all functionality
  initNavigation();
  initScrollAnimations();
  initScrollToTop();
  initMobileMenu();
  initContactForm();
  initSkillAnimations();
  initProjectModals();
  initScrollProgress();
  initPortfolioModal()
});

// Navigation functionality
function initNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");
  const navbar = document.getElementById("navbar");

  // Smooth scroll for navigation links
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });

  // Highlight active section in navigation
  function highlightActiveSection() {
    let current = "";
    const scrollPosition = window.scrollY + 100;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  }

  // Add background to navbar on scroll
  if (window.scrollY > 100) {
    navbar.classList.add("bg-darkblue/95", "navbar-blur", "shadow-lg");
  } else {
    navbar.classList.remove(
      "bg-darkblue/95",
      "navbar-blur",
      "shadow-lg",
    );
  }
  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      navbar.classList.add("bg-darkblue/95", "navbar-blur", "shadow-lg");
    } else {
      navbar.classList.remove(
        "bg-darkblue/95",
        "navbar-blur",
        "shadow-lg",
      );
    }
    highlightActiveSection();
  });

  highlightActiveSection();
}

// Scroll animations
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const staggerElements =
          entry.target.querySelectorAll(".stagger-animation");
        staggerElements.forEach((element, index) => {
          setTimeout(() => {
            element.classList.add("animate");
          }, index * 150);
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll("section").forEach((section) => {
    if (section.querySelector(".stagger-animation")) {
      staggerObserver.observe(section);
    }
  });
}

// Scroll to top button
function initScrollToTop() {
  const scrollTopBtn = document.getElementById("scroll-top");

  function toggleScrollToTop() {
    if (window.scrollY > 300) {
      scrollTopBtn.style.opacity = "1";
      scrollTopBtn.style.pointerEvents = "auto";
    } else {
      scrollTopBtn.style.opacity = "0";
      scrollTopBtn.style.pointerEvents = "none";
    }
  }

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  window.addEventListener("scroll", toggleScrollToTop);
  toggleScrollToTop();
}

// Mobile menu functionality
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  mobileMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
    const icon = mobileMenuBtn.querySelector("i");

    if (mobileMenu.classList.contains("hidden")) {
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    } else {
      icon.classList.remove("fa-bars");
      icon.classList.add("fa-times");
    }
  });

  // Close mobile menu when clicking a link
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
      const icon = mobileMenuBtn.querySelector("i");
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    });
  });
}

// Contact form functionality
function initContactForm() {
  const contactForm = document.getElementById("contact-form");

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault(); // <-- KEEP THIS LINE! It stops the default browser submission

    // 1. Prepare form data for Netlify
    const data = new FormData(contactForm);
    // Netlify expects the data to be URL-encoded (application/x-www-form-urlencoded)
    const encodedData = new URLSearchParams(data).toString();

    // 2. Show loading state (Your custom UX starts here)
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    // 3. Send the data to Netlify via Fetch API
    fetch(contactForm.action || window.location.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodedData
    })
      .then(response => {
        // Netlify returns a 200/204 status on successful form handling
        if (response.ok) {
          // SUCCESS STATE
          contactForm.reset();
          submitBtn.innerHTML = "✓ Message Sent Successfully";
          submitBtn.style.backgroundColor = "#22c55e"; // Green color

          setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.backgroundColor = "";
          }, 3000);

        } else {
          // FAILURE STATE (e.g., Netlify error)
          throw new Error('Netlify submission failed.');
        }
      })
      .catch(error => {
        // ERROR STATE (network issues, etc.)
        console.error('Submission Error:', error);
        submitBtn.innerHTML = "X Submission Failed";
        submitBtn.style.backgroundColor = "#ef4444"; // Red color

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          submitBtn.style.backgroundColor = "";
        }, 3000);
      });
  });
}

// Skill bar animations
function initSkillAnimations() {
  const skillBars = document.querySelectorAll(".skill-progress");

  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const progressBar = entry.target;
          const targetWidth = progressBar.getAttribute("data-width");

          progressBar.style.width = "0%";
          setTimeout(() => {
            progressBar.style.width = `${targetWidth}%`;
          }, 500);

          skillObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  skillBars.forEach((bar) => {
    skillObserver.observe(bar);
  });
}

// Project modals
function initProjectModals() {
  const projects = document.querySelectorAll(".detail-btn");
  const modals = document.querySelectorAll(".modal");
  const modalCloses = document.querySelectorAll(".modal-close");

  projects.forEach((project) => {
    project.addEventListener("click", () => {
      const projectId = project.getAttribute("data-project");
      const modal = document.getElementById(`projectModal${projectId}`);
      if (modal) {
        console.log(modal);
        modal.classList.remove("hidden");
        modal.classList.add("show", "flex");
        document.body.style.overflow = "hidden";
      }
    });
  });

  modalCloses.forEach((close) => {
    close.addEventListener("click", () => {
      const modal = close.closest(".modal");
      modal.classList.remove("show", "flex");
      modal.classList.add("hidden");
      document.body.style.overflow = "auto";
    });
  });

  // Close modal when clicking outside
  modals.forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("show", "flex");
        modal.classList.add("hidden");
        document.body.style.overflow = "auto";
      }
    });
  });
}

// portfolio modals
function initPortfolioModal() {
  const portfolioBtn = document.getElementById("portfolio-btn");
  const portfolioModal = document.getElementById("portfolio-modal")
  const pModalClosse = document.querySelector(".por-modal-close");

  portfolioBtn.addEventListener("click", () => {
    portfolioModal.classList.remove("hidden");
    portfolioModal.classList.add("show", "flex");
    document.body.style.overflow = "hidden";
  });

  pModalClosse.addEventListener("click", () => {
    portfolioModal.classList.remove("show", "flex");
    portfolioModal.classList.add("hidden");
    document.body.style.overflow = "auto";
  });

  // Close modal when clicking outside
  portfolioModal.addEventListener("click", (e) => {
    if (e.target === portfolioModal) {
      portfolioModal.classList.remove("show", "flex");
      portfolioModal.classList.add("hidden");
      document.body.style.overflow = "auto";
    }
  });
};

// Scroll progress bar
function initScrollProgress() {
  const scrollProgress = document.querySelector(".scroll-progress");
  const winHeight = window.innerHeight;
  const docHeight = document.documentElement.scrollHeight;
  const scrollTop = window.pageYOffset;
  const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;

  scrollProgress.style.width = scrollPercent + "%";
  window.addEventListener("scroll", () => {
    const winHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset;
    const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;
    scrollProgress.style.width = scrollPercent + "%";
  });
}
