(() => {
  const wizard = document.getElementById('registration');
  const cards = document.getElementById('join-options');
  const form = document.getElementById('join-form');
  const stepper = document.getElementById('wizard-steps');
  const status = document.getElementById('form-status');
  const registrationRow = document.getElementById('registration-row');
  const seatData = {
    morning: { name: 'Morning Seat', time: '6:00 AM – 2:00 PM', monthly: 900, quarter: 2700 },
    evening: { name: 'Afternoon / Evening Seat', time: '2:00 PM – 10:00 PM', monthly: 900, quarter: 2700 },
    full: { name: 'Full Day Seat', time: '6:00 AM – 10:00 PM', monthly: 1000, quarter: 2800 },
    large: { name: 'Large Seat — Individual', time: '6:00 AM – 10:00 PM', monthly: 1500, quarter: 3800 },
    sharing: { name: 'Large Seat — Sharing (2 Persons)', time: '6:00 AM – 10:00 PM', monthly: 1400, quarter: 4200 }
  };
  const labels = { seat: 'Seat & Timing', details: 'Details', documents: 'Documents', review: 'Review', payment: 'Payment' };
  const steps = {
    new: ['seat', 'details', 'documents', 'review', 'payment'],
    existing: ['details', 'seat', 'review', 'payment']
  };
  let memberType = 'new';
  let stepIndex = 0;

  const field = (id) => document.getElementById(id);
  const selectedPlan = () => seatData[form.querySelector('input[name="seat"]:checked')?.value] || null;
  const durationMonths = () => Number(form.querySelector('input[name="duration"]:checked')?.value || 1);
  const fee = () => {
    const plan = selectedPlan();
    if (!plan) return 0;
    return durationMonths() === 3 ? plan.quarter : plan.monthly;
  };
  const total = () => fee() + (memberType === 'new' ? 100 : 0);
  const money = (amount) => amount ? '₹' + amount.toLocaleString('en-IN') : '—';

  function updateSummary() {
    const plan = selectedPlan();
    document.getElementById('summary-type').textContent = memberType === 'new' ? 'New Registration' : 'Existing Member';
    document.getElementById('summary-seat').textContent = plan ? plan.name : 'Choose a seat';
    document.getElementById('summary-time').textContent = plan ? plan.time : '—';
    document.getElementById('summary-duration').textContent = durationMonths() === 3 ? '3 Months' : '1 Month';
    document.getElementById('summary-name').textContent = field('full-name').value.trim() || '—';
    document.getElementById('summary-seat-fee').textContent = money(fee());
    document.getElementById('summary-total').textContent = money(total());
    registrationRow.hidden = memberType !== 'new';
    if (document.activeElement !== field('amount-paid')) field('amount-paid').value = total() || '';
    document.getElementById('amount-hint').textContent = total() ? 'Enter the exact total shown: ' + money(total()) + (memberType === 'new' ? ' including the one-time registration fee.' : '.') : 'Choose a seat first to see the amount due.';
    document.querySelectorAll('[data-price]').forEach((node) => {
      const plan = seatData[node.dataset.price];
      const amount = durationMonths() === 3 ? plan.quarter : plan.monthly;
      node.innerHTML = money(amount) + '<small>/' + (durationMonths() === 3 ? '3 months' : 'month') + '</small><span class="choice">●</span>';
    });
  }

  function setMode(type) {
    memberType = type;
    document.getElementById('flow-label').textContent = type === 'new' ? 'New Member Registration' : 'Existing Member Renewal';
    document.getElementById('details-heading').textContent = type === 'new' ? 'Your details' : 'Welcome back';
    document.getElementById('details-intro').textContent = type === 'new' ? 'We’ll use this to set up your membership and ID card.' : 'Enter the mobile number registered with Gurukul Library.';
    document.querySelectorAll('.new-only').forEach((el) => { el.hidden = type !== 'new'; });
    document.querySelectorAll('.existing-only').forEach((el) => { el.hidden = type !== 'existing'; });
    field('email').required = type === 'new';
    field('id-proof').required = type === 'new';
    field('member-photo').required = type === 'new';
    document.querySelector('.wizard-switch').textContent = type === 'new' ? '← Not a new member? Switch' : '← Not registered yet? Switch';
    updateSummary();
  }

  function renderSteps() {
    const active = steps[memberType];
    stepper.style.gridTemplateColumns = 'repeat(' + active.length + ', minmax(0, 1fr))';
    stepper.innerHTML = active.map((name, index) => '<div class="wizard-step ' + (index === stepIndex ? 'active' : index < stepIndex ? 'done' : '') + '"><span class="step-dot">' + (index < stepIndex ? '✓' : (index + 1)) + '</span>' + labels[name] + '</div>').join('');
    form.querySelectorAll('[data-pane]').forEach((pane) => { pane.hidden = pane.dataset.pane !== active[stepIndex]; });
    status.hidden = true;
    if (window.innerWidth < 850) wizard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function start(type) {
    setMode(type);
    stepIndex = 0;
    cards.hidden = true;
    wizard.hidden = false;
    renderSteps();
  }

  function back() {
    if (stepIndex > 0) {
      stepIndex -= 1;
      renderSteps();
    }
  }

  function validateFiles(inputIds) {
    const maxSize = 5 * 1024 * 1024;
    for (const id of inputIds) {
      const input = field(id);
      const file = input.files && input.files[0];
      if (!file) {
        input.setCustomValidity('Please choose a file.');
        input.reportValidity();
        input.setCustomValidity('');
        return false;
      }
      if (file.size > maxSize) {
        input.setCustomValidity('This file is larger than 5 MB.');
        input.reportValidity();
        input.setCustomValidity('');
        return false;
      }
    }
    return true;
  }

  function validatePane() {
    const pane = form.querySelector('[data-pane]:not([hidden])');
    if (!pane) return false;
    if (pane.dataset.pane === 'seat' && !selectedPlan()) {
      alert('Please choose a seat to continue.');
      return false;
    }
    const controls = [...pane.querySelectorAll('input,select,textarea')].filter((el) => !el.disabled && !el.closest('[hidden]'));
    for (const control of controls) {
      if (!control.checkValidity()) {
        control.reportValidity();
        return false;
      }
    }
    if (pane.dataset.pane === 'documents' && !validateFiles(['id-proof', 'member-photo'])) return false;
    return true;
  }

  function reviewRows() {
    const plan = selectedPlan();
    const data = [
      ['Membership', memberType === 'new' ? 'New Registration' : 'Existing Member'],
      ['Seat', plan ? plan.name : '—'],
      ['Timing', plan ? plan.time : '—'],
      ['Duration', durationMonths() === 3 ? '3 Months' : '1 Month'],
      ['Full Name', field('full-name').value.trim()],
      ['Mobile', field('mobile').value.trim()]
    ];
    if (memberType === 'new') {
      data.push(['Email', field('email').value.trim()]);
      data.push(['Preparing For', field('goal').value || '—']);
      data.push(['Address', field('address').value.trim() || '—']);
      data.push(['ID Proof', field('id-proof').files[0]?.name || '—']);
      data.push(['Photo', field('member-photo').files[0]?.name || '—']);
    }
    data.push(['Seat Fee', money(fee())]);
    if (memberType === 'new') data.push(['Registration Fee', '₹100']);
    data.push(['Total Payable', money(total())]);
    document.getElementById('review-list').innerHTML = data.map(([name, value]) => '<div class="review-row"><span>' + name + '</span><strong>' + escapeHtml(value) + '</strong></div>').join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function sendToWhatsApp() {
    const pane = form.querySelector('[data-pane="payment"]');
    const controls = [...pane.querySelectorAll('input')].filter((el) => !el.disabled && !el.closest('[hidden]'));
    for (const control of controls) {
      if (!control.checkValidity()) { control.reportValidity(); return; }
    }
    if (Number(field('amount-paid').value) !== total()) {
      field('amount-paid').setCustomValidity('Please enter the exact total shown in the booking summary.');
      field('amount-paid').reportValidity();
      field('amount-paid').setCustomValidity('');
      return;
    }
    if (!validateFiles(['payment-proof'])) return;
    if (memberType === 'new' && !validateFiles(['id-proof', 'member-photo'])) return;
    const plan = selectedPlan();
    const lines = [
      'Hello Gurukul Library, I would like to know more about the membership.',
      '',
      'Membership application:',
      'Type: ' + (memberType === 'new' ? 'New registration' : 'Renewal'),
      'Name: ' + field('full-name').value.trim(),
      'Mobile: ' + field('mobile').value.trim(),
      memberType === 'new' ? 'Email: ' + field('email').value.trim() : '',
      memberType === 'new' && field('goal').value ? 'Preparing for: ' + field('goal').value : '',
      memberType === 'new' && field('address').value.trim() ? 'Address: ' + field('address').value.trim() : '',
      'Seat: ' + (plan ? plan.name : ''),
      'Timing: ' + (plan ? plan.time : ''),
      'Duration: ' + (durationMonths() === 3 ? '3 months' : '1 month'),
      'Amount paid: ₹' + Number(field('amount-paid').value).toLocaleString('en-IN'),
      'UPI / Transaction ID: ' + field('utr').value.trim(),
      '',
      'I will attach the required document and payment files in this chat.'
    ].filter(Boolean).join('\n');
    const url = 'https://wa.me/919709422890?text=' + encodeURIComponent(lines);
    const popup = window.open(url, '_blank');
    if (popup) popup.opener = null;
    else window.location.href = url;
    status.innerHTML = 'WhatsApp is opening. Attach the ID proof, member photo and payment screenshot in the chat, then tap <strong>Send</strong>. The library will verify payment and confirm your membership.';
    status.hidden = false;
  }

  document.querySelectorAll('[data-start]').forEach((button) => button.addEventListener('click', () => start(button.dataset.start)));
  document.querySelector('[data-switch]').addEventListener('click', () => { wizard.hidden = true; cards.hidden = false; });
  document.querySelector('[data-back-to-options]').addEventListener('click', () => { wizard.hidden = true; cards.hidden = false; });
  form.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', back));
  form.querySelectorAll('[data-next]').forEach((button) => button.addEventListener('click', () => {
    if (!validatePane()) return;
    const active = steps[memberType];
    if (active[stepIndex] === 'review') reviewRows();
    stepIndex = Math.min(stepIndex + 1, active.length - 1);
    if (active[stepIndex] === 'review') reviewRows();
    renderSteps();
  }));
  form.addEventListener('input', updateSummary);
  form.addEventListener('change', (event) => {
    updateSummary();
    const input = event.target;
    if (input.type === 'file') {
      const file = input.files && input.files[0];
      const label = document.querySelector('[data-file-name="' + input.id + '"]');
      if (label) label.textContent = file ? file.name : 'No file selected';
      if (file && file.size > 5 * 1024 * 1024) {
        input.value = '';
        if (label) label.textContent = 'No file selected';
        input.setCustomValidity('This file is larger than 5 MB.');
        input.reportValidity();
        input.setCustomValidity('');
      }
    }
  });
  document.getElementById('send-application').addEventListener('click', sendToWhatsApp);
  updateSummary();
})();
