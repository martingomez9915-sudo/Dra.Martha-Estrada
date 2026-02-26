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
  // FormSubmit.co envía emails automáticamente SIN necesidad de crear cuenta.
  // La PRIMERA vez que se envíe, FormSubmit enviará un correo de verificación
  // a infantilodonto@gmail.com. Solo hay que hacer clic en "Confirm" una vez
  // y de ahí en adelante todos los formularios llegarán automáticamente.

  const form = document.getElementById('appointmentForm');
  const submitBtn = document.getElementById('submitBtn');
  const formSuccess = document.getElementById('formSuccess');
  const downloadReminderBtn = document.getElementById('downloadReminder');
  let lastFormData = null;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // UI loading state
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
      // ── 1) Enviar email a la doctora via FormSubmit ──
      const doctorResponse = await fetch('https://formsubmit.co/ajax/infantilodonto@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `🦷 Nueva Cita - ${formData.child_name} | ${formData.service}`,
          _template: 'box',
          _captcha: false,
          _url: 'Consultorio Dra. Martha Estrada - SmileTrain',
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

      // ── 2) Enviar confirmación al paciente via FormSubmit ──
      const patientResponse = await fetch('https://formsubmit.co/ajax/' + formData.email, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: '✅ Confirmación de Cita - Dra. Martha Estrada | Odontología Infantil',
          _template: 'box',
          _captcha: false,
          _url: 'Consultorio Dra. Martha Estrada - SmileTrain',
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

      const doctorOk = doctorResponse.ok;
      const patientOk = patientResponse.ok;

      if (doctorOk) {
        console.log('✅ Email enviado a la doctora');
      }
      if (patientOk) {
        console.log('✅ Email de confirmación enviado al paciente');
      }

      // Show success + auto-download calendar reminder
      form.style.display = 'none';
      formSuccess.classList.add('show');
      downloadICS(formData);

      // Reset after 12 seconds
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

      // Show success anyway (the reminder still downloads)
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

  // Download reminder button (in success message)
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

