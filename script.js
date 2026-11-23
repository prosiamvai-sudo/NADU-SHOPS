(function () {
  var WA_NUMBER = 'YOUR_WHATSAPP_NUMBER';

  function extractPrice(text) {
    if (!text) return '';
    var m = text.match(/(?:দাম|মূল্য|প্রাইস|price)\s*[:：\-]?\s*([^\n।]+)/i);
    if (m && m[1]) return m[1].trim();
    var t = text.match(/(?:৳|tk\.?|টাকা)\s*\d[\d,০-৯]*|\d[\d,০-৯]*\s*(?:৳|tk\.?|টাকা)/i);
    return t ? t[0].trim() : '';
  }

  function makeWaUrl(message) {
    var cleanNum = String(WA_NUMBER || '').replace(/[^\d]/g, '');
    var encoded = encodeURIComponent(message);
    return (!cleanNum || cleanNum === 'YOURWHATSAPPNUMBER')
      ? ('https://wa.me/?text=' + encoded)
      : ('https://wa.me/' + cleanNum + '?text=' + encoded);
  }

  // Product Cards Price & WhatsApp Order Link
  var cards = document.querySelectorAll('.product-card');
  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    var title = card.getAttribute('data-title') || '';
    var url = card.getAttribute('data-url') || '';
    var snip = card.getAttribute('data-snippet') || '';
    var price = extractPrice(snip);
    var priceEl = card.querySelector('.js-card-price');
    if (priceEl && price) {
      priceEl.textContent = price.indexOf('দাম') === 0 ? price : ('দাম: ' + price);
    }
    var orderBtn = card.querySelector('.js-wa-order');
    if (orderBtn) {
      var lines = ['আসসালামু আলাইকুম, আমি এই পণ্যটি অর্ডার করতে চাই:'];
      if (title) lines.push('পণ্য: ' + title);
      if (price) lines.push('দাম: ' + price);
      if (url) lines.push('লিংক: ' + url);
      orderBtn.setAttribute('href', makeWaUrl(lines.join('\n')));
    }
  }

  // Individual Product Page Price & WhatsApp Order Link
  var detailBox = document.querySelector('.js-detail-box');
  if (detailBox) {
    var dTitle = detailBox.getAttribute('data-title') || '';
    var dUrl = detailBox.getAttribute('data-url') || window.location.href;
    var bodyEl = detailBox.querySelector('.post-body');
    var dPrice = extractPrice(bodyEl ? bodyEl.innerText : '');
    var dPriceEl = detailBox.querySelector('.js-detail-price');
    if (dPriceEl && dPrice) {
      dPriceEl.textContent = dPrice.indexOf('দাম') === 0 ? dPrice : ('দাম: ' + dPrice);
    }
    var dBtn = detailBox.querySelector('.js-wa-order');
    if (dBtn) {
      var dLines = ['আসসালামু আলাইকুম, আমি এই পণ্যটি অর্ডার করতে চাই:'];
      if (dTitle) dLines.push('পণ্য: ' + dTitle);
      if (dPrice) dLines.push('দাম: ' + dPrice);
      if (dUrl) dLines.push('লিংক: ' + dUrl);
      dBtn.setAttribute('href', makeWaUrl(dLines.join('\n')));
    }
  }

  // Client-side Search & Category Filter for Standalone HTML
  var searchForm = document.getElementById('searchForm');
  var searchInput = document.getElementById('searchInput');
  var emptyStateBox = document.getElementById('emptyStateBox');
  var sectionTitle = document.getElementById('productSectionTitle');

  function filterProducts(query, category) {
    var visibleCount = 0;
    cards.forEach(function (card) {
      var cardTitle = (card.getAttribute('data-title') || '').toLowerCase();
      var cardCat = (card.getAttribute('data-category') || '').toLowerCase();
      var matchQuery = !query || cardTitle.indexOf(query.toLowerCase()) !== -1 || cardCat.indexOf(query.toLowerCase()) !== -1;
      var matchCat = !category || cardCat === category.toLowerCase();

      if (matchQuery && matchCat) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (emptyStateBox) {
      emptyStateBox.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = searchInput.value.trim();
      if (sectionTitle) {
        sectionTitle.textContent = q ? ('অনুসন্ধানের ফলাফল: ' + q) : 'সর্বশেষ পণ্যসমূহ';
      }
      filterProducts(q, '');
    });
  }

  var categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach(function (catCard) {
    catCard.addEventListener('click', function () {
      var cat = catCard.getAttribute('data-category') || '';
      if (sectionTitle && cat) {
        sectionTitle.textContent = 'ক্যাটাগরি: ' + cat;
      }
      filterProducts('', cat);
    });
  });

  // Floating Auto-Reply Chat
  var toggleBtn = document.getElementById('chatToggleBtn');
  var closeBtn = document.getElementById('chatCloseBtn');
  var popup = document.getElementById('chatPopupBox');
  var form = document.getElementById('chatForm');
  var input = document.getElementById('chatInput');
  var body = document.getElementById('chatBody');

  if (toggleBtn && popup) {
    toggleBtn.addEventListener('click', function () {
      popup.classList.toggle('open');
      if (popup.classList.contains('open') && input) input.focus();
    });
  }
  if (closeBtn && popup) {
    closeBtn.addEventListener('click', function () {
      popup.classList.remove('open');
    });
  }
  if (form && input && body) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;

      var userBubble = document.createElement('div');
      userBubble.className = 'chat-msg-user';
      userBubble.textContent = text;
      body.appendChild(userBubble);
      input.value = '';
      body.scrollTop = body.scrollHeight;

      setTimeout(function () {
        var botBubble = document.createElement('div');
        botBubble.className = 'chat-msg-bot';
        botBubble.textContent = 'ধন্যবাদ! আপনার বার্তাটি নেওয়া হয়েছে। সরাসরি কথা বলতে এখনই WhatsApp-এ যুক্ত করা হচ্ছে...';
        body.appendChild(botBubble);
        body.scrollTop = body.scrollHeight;

        setTimeout(function () {
          window.open(makeWaUrl(text), '_blank');
        }, 900);
      }, 500);
    });
  }
})();
