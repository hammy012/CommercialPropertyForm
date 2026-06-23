document.addEventListener('DOMContentLoaded', () => {
  let currentStep = 1;
  const totalSteps = 9;
  
  // Custom Datepicker State
  let calendarDate = new Date(); // Month/Year currently viewed
  let selectedDate = null;       // Actual selected Date object
  
  // Searchable Select State
  const professionsList = [
    "Construction Contractor",
    "Consultant",
    "Retail Shop Owner",
    "IT Services & Software Developer",
    "Cafe / Restaurant / Bakery",
    "General Contractor",
    "Landscaper / Gardener",
    "Real Estate Agent / Broker",
    "Photographer / Videographer",
    "Hair Salon / Barber Shop"
  ];
  let highlightedIndex = -1;

  // Step Titles for progress display
  const stepTitles = {
    1: "Coverage Start Date",
    2: "Profession & Industry",
    3: "Business Information",
    4: "Owner Details",
    5: "Contact Information",
    6: "About Your Business",
    7: "Establishment Year",
    8: "Business Finances",
    9: "Revenue Origin"
  };

  // ==========================================
  // DOM ELEMENTS
  // ==========================================
  const form = document.getElementById('quote-form');
  const wrapper = document.querySelector('.form-wrapper');
  const stepCards = document.querySelectorAll('.step-card');
  const nextButtons = document.querySelectorAll('.btn-next');
  const backButtons = document.querySelectorAll('.btn-back');
  
  // Progress subheader elements
  const progressStepNum = document.getElementById('current-step-num');
  const progressTitle = document.getElementById('current-step-title');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressSubheader = document.querySelector('.progress-subheader');

  // Step 1: Calendar elements
  const dateInput = document.getElementById('coverage-date-input');
  const calendarToggle = document.getElementById('calendar-toggle-btn');
  const calendarPopup = document.getElementById('custom-calendar');
  const calPrevBtn = document.getElementById('cal-prev-month');
  const calNextBtn = document.getElementById('cal-next-month');
  const calMonthYearLabel = document.getElementById('cal-month-year-label');
  const calDaysGrid = document.getElementById('calendar-days-grid');
  
  // Step 2: Search select elements
  const industryInput = document.getElementById('industry-search-input');
  const industryDropdown = document.getElementById('industry-dropdown');

  // Step 3: Address & Postal Formatting
  const postalInput = document.getElementById('business-postal');

  // Step 4: DOB and Gender elements
  const dobYearSelect = document.getElementById('dob-year');
  const dobMonthSelect = document.getElementById('dob-month');
  const dobDaySelect = document.getElementById('dob-day');
  const genderButtons = document.querySelectorAll('.gender-btn');
  const genderHiddenInput = document.getElementById('owner-gender');

  // Success screen elements
  const successScreen = document.getElementById('success-screen');
  const summaryContent = document.getElementById('summary-content');
  const btnRestart = document.getElementById('btn-restart');

  // ==========================================
  // STEP NAVIGATION & ANIMATION FLOW
  // ==========================================
  
  // Initialize steps layout and activation states
  function updateStepsUI() {
    stepCards.forEach((card, index) => {
      const stepIndex = index + 1;
      card.classList.remove('active', 'completed');
      
      if (stepIndex === currentStep) {
        card.classList.add('active');
        enableFormControls(card, true);
      } else if (stepIndex < currentStep) {
        card.classList.add('completed');
        enableFormControls(card, true);
      } else {
        enableFormControls(card, false);
      }
    });

    // Update Subheader progress info
    if (currentStep <= totalSteps) {
      progressStepNum.textContent = currentStep;
      progressTitle.textContent = stepTitles[currentStep];
      const fillPercentage = ((currentStep) / totalSteps) * 100;
      progressBarFill.style.width = `${fillPercentage}%`;
      progressSubheader.classList.remove('hidden');
    }
  }

  function enableFormControls(container, enabled) {
    const inputs = container.querySelectorAll('input, select, button:not(.btn-back):not(.btn-next):not(.btn-submit)');
    inputs.forEach(input => {
      if (enabled) {
        input.removeAttribute('disabled');
      } else {
        input.setAttribute('disabled', 'disabled');
      }
    });
  }

  // Adjust container height to match active card height dynamically
  function adjustWrapperHeight() {
    const activeCard = document.getElementById(`step-${currentStep}`);
    if (activeCard && wrapper) {
      let extraHeight = 0;
      if (currentStep === 1) {
        const cal = document.getElementById('custom-calendar');
        if (cal && !cal.classList.contains('hidden')) {
          extraHeight = cal.offsetHeight + 16;
        }
      } else if (currentStep === 2) {
        const dropdown = document.getElementById('industry-dropdown');
        if (dropdown && !dropdown.classList.contains('hidden')) {
          extraHeight = dropdown.offsetHeight + 16;
        }
      }
      wrapper.style.height = `${activeCard.offsetHeight + extraHeight}px`;
    }
  }

  // Smooth sliding transition by translating the quote form vertically
  function slideToActiveStep() {
    const activeCard = document.getElementById(`step-${currentStep}`);
    if (activeCard && wrapper) {
      adjustWrapperHeight();
      
      // Prevent browser auto-scroll on the wrapper from clipping elements
      wrapper.scrollTop = 0;
      wrapper.scrollLeft = 0;
      
      const offsetTop = activeCard.offsetTop;
      form.style.transform = `translateY(-${offsetTop}px)`;
      
      // Scroll viewport window back to the top of the form card (below sticky headers)
      const headerOffset = 130; 
      const elementPosition = wrapper.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  // Navigate next with auto-scroll to validation errors
  function navigateNext(targetStep) {
    if (validateStep(currentStep)) {
      currentStep = targetStep;
      updateStepsUI();
      slideToActiveStep();
    } else {
      // Find the first error in the active card and scroll to it
      const activeCard = document.getElementById(`step-${currentStep}`);
      const firstErrorGroup = activeCard.querySelector('.form-group.has-error');
      if (firstErrorGroup) {
        const headerOffset = 140;
        const elementPosition = firstErrorGroup.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        const inputElement = firstErrorGroup.querySelector('input:not([disabled]), select:not([disabled]), button:not([disabled])');
        if (inputElement && typeof inputElement.focus === 'function') {
          inputElement.focus({ preventScroll: true });
        }
      }
    }
  }

  // Navigate back
  function navigateBack(targetStep) {
    currentStep = targetStep;
    updateStepsUI();
    slideToActiveStep();
  }

  // Bind navigation click listeners
  nextButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = parseInt(btn.getAttribute('data-next-target'));
      navigateNext(target);
    });
  });

  backButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = parseInt(btn.getAttribute('data-back-target'));
      navigateBack(target);
    });
  });


  // ==========================================
  // VALIDATION SYSTEMS
  // ==========================================
  
  function showError(fieldId, errorId, show) {
    const group = document.getElementById(fieldId).closest('.form-group');
    const errMsg = document.getElementById(errorId);
    if (show) {
      group.classList.add('has-error');
    } else {
      group.classList.remove('has-error');
    }
    // Adjust height since error visibility changes step height
    adjustWrapperHeight();
  }

  function validateStep(stepNum) {
    let isValid = true;

    if (stepNum === 1) {
      if (!selectedDate) {
        showError('coverage-date-input', 'error-date', true);
        isValid = false;
      } else {
        showError('coverage-date-input', 'error-date', false);
      }
    } 
    else if (stepNum === 2) {
      const selectedIndustry = industryInput.value.trim();
      if (!selectedIndustry || !professionsList.includes(selectedIndustry)) {
        showError('industry-search-input', 'error-industry', true);
        isValid = false;
      } else {
        showError('industry-search-input', 'error-industry', false);
      }
    } 
    else if (stepNum === 3) {
      // Validate address line
      const address = document.getElementById('business-address').value.trim();
      if (!address) {
        showError('business-address', 'error-address', true);
        isValid = false;
      } else {
        showError('business-address', 'error-address', false);
      }

      // Validate city
      const city = document.getElementById('business-city').value.trim();
      if (!city) {
        showError('business-city', 'error-city', true);
        isValid = false;
      } else {
        showError('business-city', 'error-city', false);
      }

      // Validate province selection
      const province = document.getElementById('business-province').value;
      if (!province) {
        showError('business-province', 'error-province', true);
        isValid = false;
      } else {
        showError('business-province', 'error-province', false);
      }

      // Validate Canadian Postal Code
      const postal = postalInput.value.trim();
      const postalRegex = /^[A-Z]\d[A-Z] \d[A-Z]\d$/i;
      if (!postalRegex.test(postal)) {
        showError('business-postal', 'error-postal', true);
        isValid = false;
      } else {
        showError('business-postal', 'error-postal', false);
      }
    } 
    else if (stepNum === 4) {
      // Validate Owner First Name
      const firstName = document.getElementById('owner-first-name').value.trim();
      if (!firstName) {
        showError('owner-first-name', 'error-first-name', true);
        isValid = false;
      } else {
        showError('owner-first-name', 'error-first-name', false);
      }

      // Validate Owner Last Name
      const lastName = document.getElementById('owner-last-name').value.trim();
      if (!lastName) {
        showError('owner-last-name', 'error-last-name', true);
        isValid = false;
      } else {
        showError('owner-last-name', 'error-last-name', false);
      }

      // Validate Date of Birth
      const dobY = dobYearSelect.value;
      const dobM = dobMonthSelect.value;
      const dobD = dobDaySelect.value;
      const dobError = document.getElementById('error-dob');
      
      if (!dobY || !dobM || !dobD) {
        dobYearSelect.closest('.form-group').classList.add('has-error');
        dobError.style.display = 'block';
        isValid = false;
      } else {
        dobYearSelect.closest('.form-group').classList.remove('has-error');
        dobError.style.display = 'none';
      }

      // Validate Gender buttons
      const gender = genderHiddenInput.value;
      const genderError = document.getElementById('error-gender');
      if (!gender) {
        genderHiddenInput.closest('.form-group').classList.add('has-error');
        genderError.style.display = 'block';
        isValid = false;
      } else {
        genderHiddenInput.closest('.form-group').classList.remove('has-error');
        genderError.style.display = 'none';
      }
      adjustWrapperHeight();
    }
    else if (stepNum === 5) {
      // Validate Phone Number
      const phoneInput = document.getElementById('contact-phone');
      const phone = phoneInput.value.replace(/\D/g, '');
      if (phone.length !== 10) {
        showError('contact-phone', 'error-phone', true);
        isValid = false;
      } else {
        showError('contact-phone', 'error-phone', false);
      }

      // Validate Email
      const emailInput = document.getElementById('contact-email');
      const email = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        showError('contact-email', 'error-email', true);
        isValid = false;
      } else {
        showError('contact-email', 'error-email', false);
      }
    }
    else if (stepNum === 6) {
      // Validate Home Business
      const homeVal = document.getElementById('business-home').value;
      const homeError = document.getElementById('error-business-home');
      if (!homeVal) {
        document.getElementById('business-home').closest('.form-group').classList.add('has-error');
        homeError.style.display = 'block';
        isValid = false;
      } else {
        document.getElementById('business-home').closest('.form-group').classList.remove('has-error');
        homeError.style.display = 'none';
      }
    }
    else if (stepNum === 7) {
      // Validate Established Year
      const yearInput = document.getElementById('business-established-year');
      const yearVal = parseInt(yearInput.value);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearVal) || yearVal < 1800 || yearVal > currentYear) {
        showError('business-established-year', 'error-established-year', true);
        isValid = false;
      } else {
        showError('business-established-year', 'error-established-year', false);
      }
    }
    else if (stepNum === 8) {
      // Validate Revenue
      const revenueInput = document.getElementById('business-revenue');
      const revenue = revenueInput.value.trim();
      if (!revenue || revenue === '$') {
        showError('business-revenue', 'error-revenue', true);
        isValid = false;
      } else {
        showError('business-revenue', 'error-revenue', false);
      }
    }
    else if (stepNum === 9) {
      // Validate Canada Revenue
      const canadaVal = document.getElementById('revenue-canada').value;
      const canadaError = document.getElementById('error-revenue-canada');
      if (!canadaVal) {
        document.getElementById('revenue-canada').closest('.form-group').classList.add('has-error');
        canadaError.style.display = 'block';
        isValid = false;
      } else {
        document.getElementById('revenue-canada').closest('.form-group').classList.remove('has-error');
        canadaError.style.display = 'none';
      }
    }

    return isValid;
  }

  // Clear errors dynamically on input changes
  document.getElementById('business-address').addEventListener('input', () => showError('business-address', 'error-address', false));
  document.getElementById('business-city').addEventListener('input', () => showError('business-city', 'error-city', false));
  document.getElementById('business-province').addEventListener('change', () => showError('business-province', 'error-province', false));
  document.getElementById('owner-first-name').addEventListener('input', () => showError('owner-first-name', 'error-first-name', false));
  document.getElementById('owner-last-name').addEventListener('input', () => showError('owner-last-name', 'error-last-name', false));

  // Dynamic formatting & error clearing for contacts (Step 5)
  const contactPhoneInput = document.getElementById('contact-phone');
  if (contactPhoneInput) {
    contactPhoneInput.addEventListener('input', () => {
      // Auto formatting: (XXX) XXX-XXXX
      let clean = contactPhoneInput.value.replace(/\D/g, '');
      if (clean.length > 10) clean = clean.substring(0, 10);
      let formatted = '';
      if (clean.length > 0) {
        if (clean.length <= 3) {
          formatted = `(${clean}`;
        } else if (clean.length <= 6) {
          formatted = `(${clean.substring(0, 3)}) ${clean.substring(3)}`;
        } else {
          formatted = `(${clean.substring(0, 3)}) ${clean.substring(3, 6)}-${clean.substring(6)}`;
        }
      }
      contactPhoneInput.value = formatted;
      
      if (clean.length === 10) {
        showError('contact-phone', 'error-phone', false);
      }
    });
  }

  const contactEmailInput = document.getElementById('contact-email');
  if (contactEmailInput) {
    contactEmailInput.addEventListener('input', () => {
      const email = contactEmailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        showError('contact-email', 'error-email', false);
      }
    });
  }

  // Dynamic currency prefix/commas formatting for gross revenue (Step 8)
  const businessRevenueInput = document.getElementById('business-revenue');
  if (businessRevenueInput) {
    businessRevenueInput.addEventListener('input', () => {
      let clean = businessRevenueInput.value.replace(/\D/g, '');
      if (clean) {
        let num = parseInt(clean, 10);
        businessRevenueInput.value = '$' + num.toLocaleString('en-US');
        showError('business-revenue', 'error-revenue', false);
      } else {
        businessRevenueInput.value = '';
      }
    });
  }

  // Digits filtering and error clearing for established year (Step 7)
  const establishedYearInput = document.getElementById('business-established-year');
  if (establishedYearInput) {
    establishedYearInput.addEventListener('input', () => {
      let clean = establishedYearInput.value.replace(/\D/g, '');
      establishedYearInput.value = clean.substring(0, 4); // limit to 4 digits
      const year = parseInt(clean);
      const currentYear = new Date().getFullYear();
      if (year >= 1800 && year <= currentYear) {
        showError('business-established-year', 'error-established-year', false);
      }
    });
  }

  // Generic toggle button groups (reusable click handler for home and canada revenue)
  const toggleButtons = document.querySelectorAll('.toggle-btn');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const fieldId = btn.getAttribute('data-field');
      const value = btn.getAttribute('data-value');
      const hiddenInput = document.getElementById(fieldId);
      
      if (hiddenInput) {
        hiddenInput.value = value;
        
        // Toggle active visual class
        const group = btn.closest('.toggle-btn-group');
        group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Clear validation errors
        const groupFormGroup = group.closest('.form-group');
        groupFormGroup.classList.remove('has-error');
        const errMsg = groupFormGroup.querySelector('.error-message');
        if (errMsg) errMsg.style.display = 'none';
        
        adjustWrapperHeight();
      }
    });
  });


  // ==========================================
  // STEP 1: CUSTOM CALENDAR DATEPICKER
  // ==========================================
  
  // Date Limits Setup
  const dateToday = new Date();
  dateToday.setHours(0, 0, 0, 0); // Normalize time
  
  const dateLimitMax = new Date(dateToday);
  dateLimitMax.setDate(dateToday.getDate() + 90); // Today + 90 Days

  // Open calendar
  function openCalendar() {
    calendarPopup.classList.remove('hidden');
    renderCalendar();
    adjustWrapperHeight();
  }

  // Close calendar
  function closeCalendar() {
    calendarPopup.classList.add('hidden');
    adjustWrapperHeight();
  }

  // Toggle calendar popup
  calendarToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (calendarPopup.classList.contains('hidden')) {
      openCalendar();
    } else {
      closeCalendar();
    }
  });

  dateInput.addEventListener('click', (e) => {
    e.stopPropagation();
    openCalendar();
  });

  // Month navigation
  calPrevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar();
    adjustWrapperHeight();
  });

  calNextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar();
    adjustWrapperHeight();
  });

  // Render Calendar Grid
  function renderCalendar() {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    // Set month and year title label
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    calMonthYearLabel.textContent = `${months[month]} ${year}`;

    // Clear calendar grid
    calDaysGrid.innerHTML = '';

    // First day of current month (0 is Sunday, 1 is Monday...)
    const firstDayIndex = new Date(year, month, 1).getDay();
    
    // Total days in current month
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Total days in previous month (for padding)
    const prevTotalDays = new Date(year, month, 0).getDate();

    // Populate padding days from previous month
    for (let i = firstDayIndex; i > 0; i--) {
      const dayNum = prevTotalDays - i + 1;
      const cell = document.createElement('div');
      cell.classList.add('cal-day-cell', 'disabled');
      cell.textContent = dayNum;
      calDaysGrid.appendChild(cell);
    }

    // Populate actual month days
    for (let day = 1; day <= totalDays; day++) {
      const cellDate = new Date(year, month, day);
      const cell = document.createElement('div');
      cell.classList.add('cal-day-cell');
      cell.textContent = day;

      // Check if date is today
      if (cellDate.getTime() === dateToday.getTime()) {
        cell.classList.add('today');
      }

      // Check if date is currently selected
      if (selectedDate && cellDate.getTime() === selectedDate.getTime()) {
        cell.classList.add('selected');
      }

      // Disable dates outside today and today + 90 days
      if (cellDate < dateToday || cellDate > dateLimitMax) {
        cell.classList.add('disabled');
      } else {
        // Click action to select date
        cell.addEventListener('click', (e) => {
          e.stopPropagation();
          selectDate(cellDate);
        });
      }

      calDaysGrid.appendChild(cell);
    }
  }

  // Handle date selection
  function selectDate(dateObj) {
    selectedDate = dateObj;
    
    // Format input string
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    dateInput.value = dateObj.toLocaleDateString('en-US', options);
    
    // Clear validation errors
    showError('coverage-date-input', 'error-date', false);
    
    closeCalendar();
  }


  // ==========================================
  // STEP 2: SEARCHABLE INDUSTRY DROPDOWN
  // ==========================================

  // Filter list and display results
  function renderIndustryList(filterStr = "") {
    industryDropdown.innerHTML = '';
    const filtered = professionsList.filter(item => 
      item.toLowerCase().includes(filterStr.toLowerCase())
    );

    if (filtered.length === 0) {
      const noResults = document.createElement('div');
      noResults.classList.add('dropdown-item-no-results');
      noResults.textContent = "No matching professions found";
      industryDropdown.appendChild(noResults);
      highlightedIndex = -1;
      return;
    }

    filtered.forEach((item, index) => {
      const el = document.createElement('div');
      el.classList.add('dropdown-item');
      el.textContent = item;
      
      if (index === highlightedIndex) {
        el.classList.add('highlighted');
      }

      el.addEventListener('click', () => {
        selectIndustry(item);
      });

      industryDropdown.appendChild(el);
    });
  }

  function selectIndustry(item) {
    industryInput.value = item;
    industryDropdown.classList.add('hidden');
    showError('industry-search-input', 'error-industry', false);
    highlightedIndex = -1;
    adjustWrapperHeight();
  }

  // Input events for searching
  industryInput.addEventListener('input', () => {
    highlightedIndex = -1;
    renderIndustryList(industryInput.value);
    industryDropdown.classList.remove('hidden');
    adjustWrapperHeight();
  });

  industryInput.addEventListener('focus', () => {
    renderIndustryList(industryInput.value);
    industryDropdown.classList.remove('hidden');
    adjustWrapperHeight();
  });

  // Handle keyboard navigation in Step 2 search select
  industryInput.addEventListener('keydown', (e) => {
    const items = industryDropdown.querySelectorAll('.dropdown-item');
    if (industryDropdown.classList.contains('hidden') || items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightedIndex = (highlightedIndex + 1) % items.length;
      renderIndustryList(industryInput.value);
    } 
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightedIndex = (highlightedIndex - 1 + items.length) % items.length;
      renderIndustryList(industryInput.value);
    } 
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < items.length) {
        selectIndustry(items[highlightedIndex].textContent);
      }
    } 
    else if (e.key === 'Escape') {
      industryDropdown.classList.add('hidden');
    }
  });


  // ==========================================
  // STEP 3: POSTAL CODE FORMATTING & ALPHANUMERIC MAPPING
  // ==========================================
  
  postalInput.addEventListener('input', (e) => {
    let value = postalInput.value.toUpperCase().replace(/\s/g, ''); // strip all spaces and uppercase
    
    // Canadian format helper: A1A 1A1
    if (value.length > 3) {
      value = value.substring(0, 3) + ' ' + value.substring(3, 6);
    }
    
    postalInput.value = value;
    
    // Clear error immediately if matched
    const postalRegex = /^[A-Z]\d[A-Z] \d[A-Z]\d$/i;
    if (postalRegex.test(value)) {
      showError('business-postal', 'error-postal', false);
    }
  });


  // ==========================================
  // STEP 4: OWNER BIRTHDATE & GENDER SYSTEM
  // ==========================================
  
  // Populate Year dropdown (Minimum age 18, maximum age 100)
  const currentYear = new Date().getFullYear();
  const minBirthYear = currentYear - 100;
  const maxBirthYear = currentYear - 18;

  for (let year = maxBirthYear; year >= minBirthYear; year--) {
    const opt = document.createElement('option');
    opt.value = year;
    opt.textContent = year;
    dobYearSelect.appendChild(opt);
  }

  // Dynamic Day Population
  function populateDOBDays() {
    const yearVal = parseInt(dobYearSelect.value);
    const monthVal = parseInt(dobMonthSelect.value);
    const selectedDayVal = dobDaySelect.value;

    // Reset Day Dropdown
    dobDaySelect.innerHTML = '<option value="" disabled selected>Day</option>';

    if (isNaN(monthVal)) return; // Month must be selected

    // Determine total days in month
    // Month is 0-indexed in JS (January is 0). Year defaults to non-leap if not selected yet.
    const year = isNaN(yearVal) ? 2000 : yearVal; 
    const daysInMonth = new Date(year, monthVal + 1, 0).getDate();

    // Populate day options
    for (let day = 1; day <= daysInMonth; day++) {
      const opt = document.createElement('option');
      opt.value = day;
      opt.textContent = day;
      
      // Keep previous day selected if valid
      if (parseInt(selectedDayVal) === day) {
        opt.selected = true;
      }
      
      dobDaySelect.appendChild(opt);
    }
  }

  dobMonthSelect.addEventListener('change', populateDOBDays);
  dobYearSelect.addEventListener('change', populateDOBDays);
  
  // Clear birthdate errors on selection change
  const checkDobErrors = () => {
    const dobY = dobYearSelect.value;
    const dobM = dobMonthSelect.value;
    const dobD = dobDaySelect.value;
    if (dobY && dobM && dobD) {
      dobYearSelect.closest('.form-group').classList.remove('has-error');
      document.getElementById('error-dob').style.display = 'none';
    }
  };
  
  dobYearSelect.addEventListener('change', checkDobErrors);
  dobMonthSelect.addEventListener('change', checkDobErrors);
  dobDaySelect.addEventListener('change', checkDobErrors);

  // Gender Button Toggle Listeners
  genderButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all gender buttons
      genderButtons.forEach(b => b.classList.remove('active'));
      
      // Set active on clicked button
      btn.classList.add('active');
      
      // Store value in hidden field
      const genderVal = btn.getAttribute('data-gender');
      genderHiddenInput.value = genderVal;

      // Clear error
      genderHiddenInput.closest('.form-group').classList.remove('has-error');
      document.getElementById('error-gender').style.display = 'none';
    });
  });


  // ==========================================
  // CLICK OUTSIDE DISMISS PATTERN
  // ==========================================
  document.addEventListener('click', (e) => {
    // Calendar dismiss
    if (!calendarPopup.classList.contains('hidden') && 
        !calendarPopup.contains(e.target) && 
        e.target !== dateInput && 
        e.target !== calendarToggle) {
      closeCalendar();
    }
    
    // Profession select dismiss
    if (!industryDropdown.classList.contains('hidden') && 
        !industryDropdown.contains(e.target) && 
        e.target !== industryInput) {
      industryDropdown.classList.add('hidden');
      adjustWrapperHeight();
    }
  });


  // ==========================================
  // FORM SUBMISSION & SUCCESS HANDLING
  // ==========================================
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validate final step before submitting
    if (validateStep(totalSteps)) {
      submitForm();
    } else {
      // Focus first error
      const firstError = document.querySelector('.step-card.active .has-error input, .step-card.active .has-error select');
      if (firstError) {
        firstError.focus();
      }
    }
  });

  function submitForm() {
    // Gather values
    const data = {
      coverageStart: dateInput.value,
      profession: industryInput.value,
      address: document.getElementById('business-address').value,
      city: document.getElementById('business-city').value,
      province: document.getElementById('business-province').value,
      postalCode: postalInput.value,
      ownerName: `${document.getElementById('owner-first-name').value} ${document.getElementById('owner-last-name').value}`,
      ownerPrefName: document.getElementById('owner-preferred-name').value || 'None',
      ownerDob: `${dobDaySelect.value}/${parseInt(dobMonthSelect.value) + 1}/${dobYearSelect.value}`,
      ownerGender: genderHiddenInput.value,
      phone: document.getElementById('contact-phone').value,
      email: document.getElementById('contact-email').value,
      businessHome: document.getElementById('business-home').value,
      establishedYear: document.getElementById('business-established-year').value,
      grossRevenue: document.getElementById('business-revenue').value,
      revenueCanada: document.getElementById('revenue-canada').value
    };

    // Construct summary details
    summaryContent.innerHTML = `
      <div class="summary-grid">
        <div class="summary-item">
          <span class="summary-label">Coverage Start Date</span>
          <span class="summary-val">${data.coverageStart}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Profession / Industry</span>
          <span class="summary-val">${data.profession}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Business Address</span>
          <span class="summary-val">${data.address}, ${data.city}, ${data.province} ${data.postalCode}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Business Owner</span>
          <span class="summary-val">${data.ownerName}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Preferred Name</span>
          <span class="summary-val">${data.ownerPrefName}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Owner Date of Birth</span>
          <span class="summary-val">${data.ownerDob}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Owner Gender</span>
          <span class="summary-val">${data.ownerGender}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Contact Phone</span>
          <span class="summary-val">${data.phone}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Contact Email</span>
          <span class="summary-val">${data.email}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Home Business?</span>
          <span class="summary-val">${data.businessHome}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Established Year</span>
          <span class="summary-val">${data.establishedYear}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Gross Annual Revenue</span>
          <span class="summary-val">${data.grossRevenue}</span>
        </div>
        <div class="summary-item col-span-full">
          <span class="summary-label">Canada Revenue Only?</span>
          <span class="summary-val">${data.revenueCanada}</span>
        </div>
      </div>
    `;

    // Visual animation transition
    progressSubheader.classList.add('hidden');
    
    // Hide the form track and show success card
    form.style.display = 'none';
    successScreen.classList.remove('hidden');
    
    // Set wrapper height to success screen height
    wrapper.style.height = `${successScreen.offsetHeight}px`;
    
    successScreen.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Start a new quote logic
  btnRestart.addEventListener('click', () => {
    // Reset Form fields
    form.reset();
    selectedDate = null;
    genderButtons.forEach(b => b.classList.remove('active'));
    genderHiddenInput.value = '';
    
    // Reset new toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('business-home').value = '';
    document.getElementById('revenue-canada').value = '';
    
    // Reset form display and positions
    form.style.display = 'flex';
    form.style.transform = 'translateY(0px)';
    
    // Reset layout states
    currentStep = 1;
    successScreen.classList.add('hidden');
    stepCards.forEach(card => {
      card.classList.remove('has-error');
    });
    
    updateStepsUI();
    slideToActiveStep();
  });

  // ==========================================
  // HELP MODAL & FAQ ACCORDION SYSTEM
  // ==========================================
  const helpLinks = document.querySelectorAll('.help-link');
  const helpModal = document.getElementById('help-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const closeModalFooterBtn = document.getElementById('close-modal-footer-btn');
  const faqQuestions = document.querySelectorAll('.faq-question');

  // Open Help Modal
  function openHelpModal(e) {
    if (e) e.preventDefault();
    helpModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background page scroll
  }

  // Close Help Modal
  function closeHelpModal() {
    helpModal.classList.add('hidden');
    document.body.style.overflow = ''; // Restore background scroll
  }

  // Attach event listeners to all Help Links
  helpLinks.forEach(link => {
    link.addEventListener('click', openHelpModal);
  });

  // Attach event listeners to Close buttons
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeHelpModal);
  if (closeModalFooterBtn) closeModalFooterBtn.addEventListener('click', closeHelpModal);

  // Close Modal when clicking on the overlay background
  if (helpModal) {
    helpModal.addEventListener('click', (e) => {
      if (e.target === helpModal) {
        closeHelpModal();
      }
    });
  }

  // Close Modal when pressing the Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !helpModal.classList.contains('hidden')) {
      closeHelpModal();
    }
  });

  // FAQ Accordion click functionality (toggles active state)
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const isActive = question.classList.contains('active');
      
      // Close all FAQs first
      faqQuestions.forEach(q => {
        q.classList.remove('active');
      });
      
      // Open clicked if not already active
      if (!isActive) {
        question.classList.add('active');
      }
    });
  });

  // ==========================================
  // INITIAL INITIALIZATION RUN
  // ==========================================
  // Intercept and prevent scroll events on form wrapper to prevent auto-scrolling on input focus
  if (wrapper) {
    wrapper.addEventListener('scroll', () => {
      wrapper.scrollTop = 0;
      wrapper.scrollLeft = 0;
    });
  }

  updateStepsUI();
  setTimeout(slideToActiveStep, 100);
  
  // Handle window resizing dynamically
  window.addEventListener('resize', adjustWrapperHeight);
  
});
