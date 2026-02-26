/* ===== Dra. Martha Estrada — Main Script ===== */

document.addEventListener('DOMContentLoaded', () => {

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

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

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
      if (entry.isIntersecting) entry.target.classList.add('active');
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
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
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }

  function nextSlide() { goToSlide((currentSlide + 1) % totalSlides); }
  function startAutoSlide() { slideInterval = setInterval(nextSlide, 5000); }
  function stopAutoSlide() { clearInterval(slideInterval); }

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

  // ===== Generate .ics Calendar Reminder =====
  function generateICS(data) {
    const dateStr = data.preferred_date.replace(/-/g, '');
    let startTime, endTime;
    if (data.preferred_time.includes('Mañana')) {
      startTime = '090000';
      endTime = '100000';
    } else {
      startTime = '130000';
      endTime = '150000';
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Dra Martha Estrada//Cita Odontológica//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART:${dateStr}T${startTime}`,
      `DTEND:${dateStr}T${endTime}`,
      `SUMMARY:🦷 Cita Odontológica - ${data.child_name} | Dra. Martha Estrada`,
      `DESCRIPTION:Cita de ${data.service} para ${data.child_name} (${data.child_age} años).\\nPadre/Madre: ${data.parent_name}\\nTeléfono: ${data.phone}\\n\\n📍 Holguines Trade Center\\nCra. 100 #11-60\\, Ciudad Jardín\\, Cali\\n6to Piso\\n\\n📱 WhatsApp: +57 310 423 5804\\n📧 infantilodonto@gmail.com`,
      'LOCATION:Holguines Trade Center\\, Cra. 100 #11-60\\, Ciudad Jardín\\, Cali\\, 6to Piso',
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      `DESCRIPTION:Recordatorio: Mañana tiene cita odontológica para ${data.child_name} con la Dra. Martha Estrada`,
      'END:VALARM',
      'BEGIN:VALARM',
      'TRIGGER:-PT2H',
      'ACTION:DISPLAY',
      `DESCRIPTION:En 2 horas: Cita odontológica para ${data.child_name} - Holguines Trade Center, 6to Piso`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
  }

  function downloadICS(data) {
    const ics = generateICS(data);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cita_Dra_Martha_Estrada_${data.child_name.replace(/\s/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ===== Appointment Form Submission via FormSubmit.co =====
  const form = document.getElementById('appointmentForm');
  const submitBtn = document.getElementById('submitBtn');
  const formSuccess = document.getElementById('formSuccess');
  const downloadReminderBtn = document.getElementById('downloadReminder');
  let lastFormData = null;

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
      notes: document.getElementById('notes').value || 'Sin notas adicionales'
    };

    lastFormData = formData;

    try {
      // Enviar email a la doctora
      await fetch('https://formsubmit.co/ajax/infantilodonto@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `🦷 Nueva Cita - ${formData.child_name} | ${formData.service}`,
          _template: 'box',
          _captcha: false,
          'Padre/Madre': formData.parent_name,
          'Teléfono': formData.phone,
          'Email del padre': formData.email,
          'Nombre del niño(a)': formData.child_name,
          'Edad': formData.child_age + ' años',
          'Servicio solicitado': formData.service,
          'Fecha preferida': formData.preferred_date,
          'Horario preferido': formData.preferred_time,
          'Notas adicionales': formData.notes
        })
      });

      // Enviar confirmación al paciente
      await fetch('https://formsubmit.co/ajax/' + formData.email, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: '✅ Confirmación de Cita - Dra. Martha Estrada | Odontología Infantil',
          _template: 'box',
          _captcha: false,
          'Mensaje': '¡Hola ' + formData.parent_name + '! Hemos recibido tu solicitud de cita.',
          'Paciente': formData.child_name,
          'Servicio': formData.service,
          'Fecha solicitada': formData.preferred_date,
          'Horario': formData.preferred_time,
          'Estado': '⏳ Pendiente de confirmación - Te contactaremos pronto',
          'Ubicación': 'Holguines Trade Center, Cra. 100 #11-60, Ciudad Jardín, Cali - 6to Piso',
          'Teléfono consultorio': '+57 310 423 5804',
          'Nota': 'La Dra. Martha Estrada se pondrá en contacto contigo para confirmar la fecha y hora exacta de tu cita.'
        })
      });

      form.style.display = 'none';
      formSuccess.classList.add('show');
      downloadICS(formData);

      setTimeout(() => {
        form.style.display = 'block';
        formSuccess.classList.remove('show');
        form.reset();
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').textContent = 'Solicitar Cita →';
      }, 12000);

    } catch (error) {
      console.error('Error enviando formulario:', error);
      form.style.display = 'none';
      formSuccess.classList.add('show');
      downloadICS(formData);
      alert('Hubo un problema al enviar el correo. Se descargó el recordatorio. Por favor contáctanos por WhatsApp al +57 310 423 5804');
      setTimeout(() => {
        form.style.display = 'block';
        formSuccess.classList.remove('show');
        form.reset();
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').textContent = 'Solicitar Cita →';
      }, 12000);
    }
  });

  if (downloadReminderBtn) {
    downloadReminderBtn.addEventListener('click', () => {
      if (lastFormData) downloadICS(lastFormData);
    });
  }

  // ===== Smooth scroll for all anchor links =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
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
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(update);
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
  if (heroStats) statsObserver.observe(heroStats);

  // ===== Animación del niño corriendo hacia la doctora =====
  const childG = document.getElementById('childG');
  const scene  = document.getElementById('heroScene');

  if (childG && scene) {
    function stopRun() { childG.classList.add('arrived'); }
    function restartAnim() {
      childG.classList.remove('arrived');
      // Forzar reflow para reiniciar animaciones CSS
      scene.querySelectorAll('[class]').forEach(el => {
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = '';
      });
    }

    // Primera parada después de 2.05s
    setTimeout(stopRun, 2050);

    // Reiniciar cada 6.2s
    setInterval(() => {
      restartAnim();
      setTimeout(stopRun, 2050);
    }, 6200);
  }
});
