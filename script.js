/* ===== Dra. Martha Estrada — Main Script ===== */

document.addEventListener('DOMContentLoaded', () => {
  // ===== EmailJS Init =====
  // NOTE: Replace these with your actual EmailJS credentials
  // 1. Go to https://www.emailjs.com/ and create a free account
  // 2. Add an email service (Gmail) and get SERVICE_ID
  // 3. Create an email template and get TEMPLATE_ID
  // 4. Get your PUBLIC_KEY from Account > API Keys
  const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
  const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
  const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

  if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  // ===== Navbar Scroll Effect =====
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // ===== Burger Menu =====
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');

  burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!burger.contains(e.target) && !navLinks.contains(e.target)) {
      burger.classList.remove('active');
      navLinks.classList.remove('active');
    }
  });

  // ===== Scroll Reveal Animations =====
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => revealObserver.observe(el));

  // ===== Testimonials Slider =====
  const track = document.getElementById('testimonialTrack');
  const dots = document.querySelectorAll('.slider-dot');
  let currentSlide = 0;
  const totalSlides = dots.length;
  let slideInterval;

  function goToSlide(index) {
    currentSlide = index;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % totalSlides);
  }

  function startAutoSlide() {
    slideInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoSlide() {
    clearInterval(slideInterval);
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      stopAutoSlide();
      goToSlide(parseInt(dot.dataset.index));
      startAutoSlide();
    });
  });

  startAutoSlide();

  // ===== Set minimum date for appointment =====
  const dateInput = document.getElementById('preferredDate');
  if (dateInput) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
  }

  // ===== Appointment Form Submission =====
  const form = document.getElementById('appointmentForm');
  const submitBtn = document.getElementById('submitBtn');
  const formSuccess = document.getElementById('formSuccess');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = 'Enviando...';

    const formData = {
      parent_name: document.getElementById('parentName').value,
      phone: document.getElementById('phone').value,
      email: document.getElementById('email').value,
      child_name: document.getElementById('childName').value,
      child_age: document.getElementById('childAge').value,
      service: document.getElementById('service').value,
      preferred_date: document.getElementById('preferredDate').value,
      preferred_time: document.getElementById('preferredTime').value,
      notes: document.getElementById('notes').value || 'Sin notas adicionales',
      to_email: 'infantilodonto@gmail.com'
    };

    try {
      if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
        // Send via EmailJS
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, formData);
      } else {
        // Fallback: open mailto link with form data
        const subject = encodeURIComponent(`Nueva Cita - ${formData.child_name} | ${formData.service}`);
        const body = encodeURIComponent(
          `🦷 NUEVA SOLICITUD DE CITA\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `👤 Padre/Madre: ${formData.parent_name}\n` +
          `📱 Teléfono: ${formData.phone}\n` +
          `📧 Email: ${formData.email}\n\n` +
          `👶 Paciente: ${formData.child_name}\n` +
          `🎂 Edad: ${formData.child_age} años\n\n` +
          `🏥 Servicio: ${formData.service}\n` +
          `📅 Fecha preferida: ${formData.preferred_date}\n` +
          `🕐 Horario: ${formData.preferred_time}\n\n` +
          `📝 Notas: ${formData.notes}\n`
        );
        window.open(`mailto:infantilodonto@gmail.com?subject=${subject}&body=${body}`, '_self');
      }

      // Show success
      form.style.display = 'none';
      formSuccess.classList.add('show');

      // Reset after 8 seconds
      setTimeout(() => {
        form.style.display = 'block';
        formSuccess.classList.remove('show');
        form.reset();
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').textContent = 'Solicitar Cita →';
      }, 8000);

    } catch (error) {
      console.error('Error sending email:', error);

      // Fallback to mailto on error
      const subject = encodeURIComponent(`Nueva Cita - ${formData.child_name} | ${formData.service}`);
      const body = encodeURIComponent(
        `NUEVA SOLICITUD DE CITA\n\n` +
        `Padre/Madre: ${formData.parent_name}\n` +
        `Teléfono: ${formData.phone}\n` +
        `Email: ${formData.email}\n` +
        `Paciente: ${formData.child_name}\n` +
        `Edad: ${formData.child_age} años\n` +
        `Servicio: ${formData.service}\n` +
        `Fecha preferida: ${formData.preferred_date}\n` +
        `Horario: ${formData.preferred_time}\n` +
        `Notas: ${formData.notes}\n`
      );
      window.open(`mailto:infantilodonto@gmail.com?subject=${subject}&body=${body}`, '_self');

      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-text').textContent = 'Solicitar Cita →';
    }
  });

  // ===== Smooth scroll for all anchor links =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ===== Counter animation for hero stats =====
  const statItems = document.querySelectorAll('.stat-item h3');
  let statsCounted = false;

  function animateCounter(el) {
    const text = el.textContent;
    const match = text.match(/(\d+)/);
    if (!match) return;

    const target = parseInt(match[0]);
    const suffix = text.replace(match[0], '');
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(target * eased);
      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !statsCounted) {
      statsCounted = true;
      statItems.forEach(animateCounter);
    }
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    statsObserver.observe(heroStats);
  }
});
