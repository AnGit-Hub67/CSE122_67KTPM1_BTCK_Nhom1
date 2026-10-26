(() => {
  "use strict";
  const page = document.body.dataset.page;
  const siteRoot = new URL('../../', document.currentScript.src);
  const results = document.querySelector("#results");
  const status = document.querySelector("#status");
  const controls = document.querySelector("#controls");
  const search = document.querySelector("#search");
  const category = document.querySelector("#category");
  const savedOnly = document.querySelector("#saved-only");
  const feedback = document.querySelector("#feedback");
  const dialog = document.querySelector("#content-dialog");
  const storageKey = "campusmind.visitor.savedResources.v1";
  let data;
  let publicSlots = [], scheduleError = false;
  let saved = new Set();
  let ready = false;
  let loadVersion = 0;
  const normalize = (value) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .trim();
  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const button = (text, action, className) => {
    const node = element("button", text, className);
    node.type = "button";
    node.addEventListener("click", action);
    return node;
  };
  const link = (text, href, className) => {
    const node = element("a", text, className);
    node.href = href;
    return node;
  };
  function readSaved() {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (!Array.isArray(value) || !value.every((id) => typeof id === "string"))
        throw new Error("Invalid saved data");
      saved = new Set(value);
    } catch {
      saved = new Set();
      feedback.textContent =
        "Không thể đọc mục đã lưu. Bạn vẫn có thể xem tài nguyên và thử lưu lại.";
    }
  }
  function openDialog(title, paragraphs) {
    document.querySelector("#dialog-title").textContent = title;
    document
      .querySelector("#dialog-body")
      .replaceChildren(...paragraphs.map((text) => element("p", text)));
    dialog.showModal();
  }
  document
    .querySelector("#close-dialog")
    .addEventListener("click", () => dialog.close());
  function showState(title, description, actionText, action) {
    results.className = "state";
    results.replaceChildren(element("h2", title), element("p", description));
    if (action) results.append(button(actionText, action));
  }
  function reset() {
    search.value = "";
    category.value = "";
    if (savedOnly) savedOnly.checked = false;
    renderList();
    search.focus();
  }
  function toggleSave(resource, target) {
    const next = new Set(saved);
    next.has(resource.id) ? next.delete(resource.id) : next.add(resource.id);
    try {
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      saved = next;
      const clear = document.querySelector("#clear-saved");
      if (clear) clear.disabled = saved.size === 0;
      feedback.textContent = `${saved.has(resource.id) ? "Đã lưu" : "Đã bỏ lưu"}: ${resource.title}.`;
      if (savedOnly.checked) {
        renderList();
        const nextButton = results.querySelector("button[data-save]");
        (nextButton || savedOnly).focus();
      } else {
        target.textContent = saved.has(resource.id)
          ? "Bỏ lưu"
          : "Lưu tài nguyên";
        target.setAttribute(
          "aria-label",
          `${target.textContent}: ${resource.title}`,
        );
        target.setAttribute("aria-pressed", String(saved.has(resource.id)));
      }
    } catch {
      feedback.textContent =
        "Không thể lưu trên trình duyệt này. Hãy kiểm tra quyền lưu trữ rồi thử lại. Thay đổi chưa được lưu.";
    }
  }
  function renderList() {
    if (!ready) return;
    const clear = document.querySelector("#clear-saved");
    if (clear) clear.disabled = saved.size === 0;
    const items = data[page].filter(
      (item) =>
        (!category.value || item.category === category.value) &&
        normalize(
          `${item.title} ${item.description} ${item.category}`,
        ).includes(normalize(search.value)) &&
        (!savedOnly?.checked || saved.has(item.id)),
    );
    status.textContent = `${items.length} ${page === "services" ? "dịch vụ" : "tài nguyên"} phù hợp`;
    if (!items.length) {
      showState(
        "Chưa tìm thấy kết quả",
        "Thử một từ khóa khác hoặc bỏ bớt bộ lọc để khám phá thêm.",
        "Xóa bộ lọc",
        reset,
      );
      return;
    }
    results.className = "grid";
    results.replaceChildren(
      ...items.map((item) => {
        const card = element("article", undefined, "card");
        card.append(
          element(
            "span",
            item.category,
            `badge${page === "resources" ? " teal" : ""}`,
          ),
          element("h3", item.title),
          element("p", item.description),
          element("p", item.format || item.duration, "meta"),
        );
        if (page === "services") card.append(element("p", "Thời lượng dịch vụ là dự kiến. Xem giờ bắt đầu–kết thúc ở hồ sơ chuyên viên trước khi đặt lịch.", "meta"));
        const actions = element("div", undefined, "actions");
        if (page === "services") {
          if (item.counselorId && data.counselors.some(c => c.id === item.counselorId)) actions.append(
            link(
              "Xem chuyên viên →",
              `visitor-counselor-detail.html?id=${encodeURIComponent(item.counselorId)}`,
              "button",
            ),
          );
          else { const pending = button("Chưa phân công chuyên viên", () => {}); pending.disabled = true; actions.append(pending); }
        } else {
          actions.append(
            button("Đọc tài nguyên", () => openDialog(item.title, item.body)),
          );
          const save = button(
            saved.has(item.id) ? "Bỏ lưu" : "Lưu tài nguyên",
            (event) => toggleSave(item, event.currentTarget),
          );
          save.dataset.save = item.id;
          save.setAttribute("aria-label", `${save.textContent}: ${item.title}`);
          save.setAttribute("aria-pressed", String(saved.has(item.id)));
          actions.append(save);
        }
        card.append(actions);
        return card;
      }),
    );
  }
  function renderCounselor() {
    const id = new URLSearchParams(location.search).get("id");
    if (!id) {
      document.querySelector('h1').textContent = 'Gặp gỡ những người đồng hành cùng bạn';
      status.textContent = `${data.counselors.length} chuyên viên`;
      results.className = 'grid';
      results.replaceChildren(...data.counselors.map(person => {
        const card = element('article', undefined, 'card');
        const avatar = element('div', person.initials, 'avatar');
        avatar.setAttribute('aria-hidden', 'true');
        card.append(avatar, element('h2', [person.qualification, person.name].filter(Boolean).join(' ')),
          element('p', person.expertise.join(' · ')), element('p', person.experience || 'Chưa bổ sung kinh nghiệm', 'meta'));
        const slots = publicSlots.filter(slot => slot.counselorId === person.id).slice(0, 3);
        const list = element('ul', undefined, 'slots');
        slots.forEach(slot => list.append(element('li', `${slot.date.split('-').reverse().join('/')} · ${slot.start}–${slot.end} · Còn trống`)));
        card.append(slots.length ? list : element('p', scheduleError ? 'Chưa tải được lịch khả dụng. Vui lòng thử lại sau.' : 'Chưa có lịch trống được công bố.', 'meta'));
        const actions = element('div', undefined, 'actions');
        actions.append(link('Xem hồ sơ', `visitor-counselor-detail.html?id=${encodeURIComponent(person.id)}`, 'button'),
          button('Đặt lịch với chuyên viên', () => book(person.id), 'primary'));
        card.append(actions, element('small', 'Thông tin minh họa cho mục đích học tập'));
        return card;
      }));
      if (!data.counselors.length) showState('Chưa có chuyên viên', 'Vui lòng quay lại sau.');
      return;
    }
    const person = data.counselors.find((item) => item.id === id);
    status.textContent = "";
    if (!person) {
      showState(
        "Không tìm thấy chuyên viên",
        "Hồ sơ này không tồn tại hoặc đường dẫn không chính xác. Vui lòng quay lại danh mục dịch vụ để chọn chuyên viên",
      );
      results.append(
        link("Về danh mục dịch vụ", "visitor-service-directory.html", "button"),
      );
      return;
    }
    document.title = `${person.name} — CampusMind`;
    document.querySelector("h1").textContent = [person.qualification, person.name].filter(Boolean).join(' ');
    results.className = "detail-layout";
    const profile = element("section", undefined, "panel");
    profile.setAttribute("aria-label", "Thông tin chuyên viên");
    const avatar = element("div", person.initials, "avatar");
    avatar.setAttribute("aria-hidden", "true");
    profile.append(
      avatar,
      element("h2", person.role),
      element("p", person.bio),
      element("h3", "Lĩnh vực đồng hành"),
    );
    if (person.experience) profile.append(element('p', person.experience));
    if (person.organization) profile.append(element('p', person.organization));
    if (person.email) profile.append(element('p', person.email));
    const tags = element("ul", undefined, "tags");
    person.expertise.forEach((skill) =>
      tags.append(element("li", skill, "badge")),
    );
    profile.append(
      tags,
      element("h3", "Hình thức & ngôn ngữ"),
      element("p", person.format),
      element("p", person.languages),
    );
    const availability = element("section", undefined, "panel");
    availability.setAttribute("aria-labelledby", "availability-title");
    const heading = element("h2", "Lịch khả dụng");
    heading.id = "availability-title";
    availability.append(heading, element("p", "Giờ Việt Nam (UTC+7). Lịch lấy từ nguồn Student/Counselor trên cùng trình duyệt; thời lượng buổi gặp là khoảng từ giờ bắt đầu đến giờ kết thúc.", "meta"));
    if (scheduleError) {
      availability.append(element("p", "Chưa đọc được lịch chung. Cần tích hợp Student/Counselor và cho phép lưu trữ trình duyệt. Hồ sơ vẫn có thể xem; không có khung giờ nào được xác nhận là còn trống.", "notice"), button("Tải lại lịch", load));
    } else {
      const available = publicSlots.filter(slot => slot.counselorId === person.id);
      if (available.length) {
        const slots = element("ul", undefined, "slots");
        available.forEach(slot => slots.append(element("li", `${slot.date.split('-').reverse().join('/')} · ${slot.start}–${slot.end}`)));
        availability.append(slots, button("Đặt lịch với chuyên viên", () => book(person.id), "primary"));
      } else {
        availability.append(element("p", "Chưa có lịch trống trong dữ liệu hiện tại. Hãy chọn chuyên viên khác hoặc quay lại sau.", "notice"));
        const unavailable = button("Chưa có lịch trống", () => {});
        unavailable.disabled = true;
        availability.append(unavailable);
      }
      const alternatives = [...new Set(publicSlots.map(slot => slot.counselorId))].filter(id => id !== person.id);
      for (const id of alternatives) {
        const other = data.counselors.find(c => c.id === id);
        if (other) availability.append(link(`Xem lịch còn trống: ${other.name}`, `visitor-counselor-detail.html?id=${encodeURIComponent(id)}`, "button"));
      }
    }
    availability.append(button("Tìm hiểu cách đặt lịch", () => openDialog("Quy trình đặt lịch", [
      "Đăng nhập ở khu vực Sinh viên và chọn thời gian. Yêu cầu mới ở trạng thái chờ xác nhận; chuyên viên xác nhận trong khu vực của mình. Xem trạng thái tại Lịch hẹn của tôi.",
      "Bạn có thể đổi hoặc hủy lịch đang chờ/đã xác nhận khi giờ hẹn còn ở tương lai. Đổi lịch sẽ chuyển yêu cầu về chờ xác nhận. Việc xem hồ sơ chưa gửi yêu cầu hoặc giữ chỗ.",
      "Thao tác chỉ lưu trên trình duyệt, không gửi email hay tin nhắn và không đồng bộ giữa thiết bị. Không nhập thông tin tham vấn cá nhân thật."
    ])), link("Khám phá dịch vụ khác →", "visitor-service-directory.html"));
    results.replaceChildren(profile, availability);
  }
  function validate(value) {
    const fields = {
      resources: ["id", "title", "category", "description", "duration"],
      counselors: [
        "id",
        "name",
        "initials",
        "role",
        "bio",
        "languages",
        "format",
      ],
    };
    for (const [key, required] of Object.entries(fields)) {
      if (!Array.isArray(value?.[key])) throw new Error("Invalid dataset");
      const ids = new Set();
      for (const item of value[key]) {
        if (
          !item ||
          required.some(
            (field) => typeof item[field] !== "string" || !item[field].trim(),
          ) ||
          ids.has(item.id)
        )
          throw new Error("Invalid record");
        ids.add(item.id);
        for (const field of key === "resources"
          ? ["body"]
          : key === "counselors"
            ? ["expertise"]
            : []) {
          if (
            !Array.isArray(item[field]) ||
            !item[field].every((text) => typeof text === "string")
          )
            throw new Error("Invalid list");
        }
      }
    }
    return value;
  }
  async function load() {
    const version = ++loadVersion;
    ready = false;
    window.dispatchEvent(new Event("campusmind:catalog-loading"));
    if (controls) controls.disabled = true;
    results.setAttribute("aria-busy", "true");
    status.textContent = "Đang tải dữ liệu…";
    results.className = "grid";
    results.replaceChildren(...Array.from({length: 3}, () => {
      const card = element("div", undefined, "card loading-skeleton");
      card.setAttribute("aria-hidden", "true");
      for (let i = 0; i < 4; i++) card.append(element("span"));
      return card;
    }));
    try {
      const response = await fetch("../../assets/data/visitor.json", {
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error("Load failed");
      const loaded = validate(await response.json());
      loaded.counselors = window.CampusMindPublicProfiles?.read(loaded.counselors) || loaded.counselors;
      if (page === "services") {
        const catalog = await CampusMindServices.read();
        feedback.textContent = catalog.mode === 'offline' ? 'Đang dùng danh mục trên thiết bị. Chưa kết nối được nguồn trực tuyến.' : '';
        loaded.services = catalog.items.filter(s => s.status === "active").map(s => ({ ...s, title: s.name, format: `${s.duration} phút` }));
      }
      if (page === "counselors") {
        try {
          const slots = await Promise.race([CampusMindPublicSchedule.read(), new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))]);
          if (version !== loadVersion) return;
          publicSlots = slots; scheduleError = false;
        } catch {
          if (version !== loadVersion) return;
          publicSlots = []; scheduleError = true;
        }
      }
      if (version !== loadVersion) return;
      data = loaded;
      ready = true;
      if (page === "counselors") renderCounselor();
      else {
        const selectedCategory = category.value;
        category.replaceChildren(
          new Option("Tất cả chủ đề", ""),
          ...[...new Set(data[page].map((item) => item.category))].map(
            (value) => new Option(value, value),
          ),
        );
        renderList();
        window.dispatchEvent(new CustomEvent("campusmind:catalog", {detail: {items: data[page]}}));
      }
    } catch {
      if (version !== loadVersion) return;
      window.dispatchEvent(new Event("campusmind:catalog-error"));
      status.textContent = "Không tải được dữ liệu.";
      showState(
        "Nội dung chưa tải được",
        "Vui lòng kiểm tra kết nối rồi thử lại. Nội dung bạn đã lưu trên thiết bị vẫn được giữ.",
        "Thử lại",
        load,
      );
    } finally {
      if (version !== loadVersion) return;
      results.setAttribute("aria-busy", "false");
      if (controls) controls.disabled = !ready;
    }
  }
  let bookingBusy = false;
  async function book(id) {
    if (bookingBusy) return;
    bookingBusy = true;
    try {
      const user = await window.CampusSession?.ready;
      const booking = new URL(`pages/student/student-booking.html?counselor=${encodeURIComponent(id)}`, siteRoot);
      if (user?.role === 'student') {
        const response = await fetch(booking, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
        if (response.ok) { location.href = booking.href; return; }
        openDialog('Trang đặt lịch chưa sẵn sàng', ['Vui lòng quay lại sau khi khu vực sinh viên được tích hợp.']);
        return;
      }
      openDialog('Vui lòng đăng nhập trước khi đặt lịch', ['Đăng nhập bằng tài khoản sinh viên để chọn ngày và khung giờ.']);
      const login = button('Đăng nhập', () => {} , 'primary');
      login.disabled = true;
      const body = document.querySelector('#dialog-body');
      body.append(login);
      for (const route of ['sv2-login.html', 'login.html']) {
        const url = new URL(route, siteRoot);
        const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
        if (response.ok) {
          if (dialog.open && body.contains(login)) {
            login.disabled = false;
            login.onclick = () => { url.searchParams.set('role', 'student'); location.href = url.href; };
          }
          return;
        }
      }
      if (body.contains(login)) body.append(element('p', 'Trang đăng nhập chưa được tích hợp trong bản này. Bạn vẫn có thể xem hồ sơ và tài nguyên.'));
    } catch {
      openDialog('Chưa mở được trang đăng nhập', ['Vui lòng kiểm tra kết nối rồi thử lại.']);
    } finally { bookingBusy = false; }
  }
  window.addEventListener('campusmind:accept-suggestion', event => {
    if (!ready || !['services', 'resources'].includes(page)) return;
    const selected = data[page].find(item => item.id === event.detail?.id);
    if (!selected) return;
    search.value = selected.title; category.value = selected.category;
    if (savedOnly) savedOnly.checked = false;
    renderList();
  });
  search?.addEventListener("input", renderList);
  category?.addEventListener("change", renderList);
  savedOnly?.addEventListener("change", renderList);
  document.querySelector("#reset")?.addEventListener("click", reset);
  document
    .querySelector("#filters")
    ?.addEventListener("submit", (event) => event.preventDefault());
  if (page === "resources") {
    const clearDialog = document.querySelector('#clear-saved-dialog');
    document.querySelector('#clear-saved').addEventListener('click', () => {
      document.querySelector('#clear-saved-error').textContent = '';
      clearDialog.showModal();
    });
    document.querySelector('#confirm-clear-saved').addEventListener('click', () => {
      try {
        localStorage.removeItem(storageKey);
        saved = new Set();
        renderList();
        clearDialog.close();
        savedOnly.focus();
        feedback.textContent = 'Đã xóa danh sách tài nguyên đã lưu trên trình duyệt này.';
      } catch {
        document.querySelector('#clear-saved-error').textContent = 'Không thể xóa danh sách. Hãy kiểm tra quyền lưu trữ rồi thử lại.';
      }
    });
    readSaved();
    window.addEventListener("storage", (event) => {
      if (event.key === storageKey || event.key === null) {
        readSaved();
        renderList();
      }
    });
  }
  if (page === "services") window.addEventListener("storage", event => {
    if (event.key === CampusMindServices.key || event.key === null) load();
  });
  if (page === "counselors") {
    window.addEventListener("storage", event => {
      if ([null, "campusmind.counselor.v1", "campusmind.sv2.users.v1"].includes(event.key)) load();
    });
    window.addEventListener("pageshow", event => { if (event.persisted) load(); });
    document.addEventListener("visibilitychange", () => { if (!document.hidden) load(); });
    setInterval(() => { if (!document.hidden && ready) load(); }, 60000);
  }
  load();
})();
