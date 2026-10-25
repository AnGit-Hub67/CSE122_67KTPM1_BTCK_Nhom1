(() => {
  'use strict';
  const clean = (value, max) => typeof value === 'string' && value.trim().length <= max ? value.trim() : '';
  function read(seeds) {
    let users;
    try { users = JSON.parse(localStorage.getItem('campusmind.sv2.users.v1') || '[]'); }
    catch { users = []; }
    if (!Array.isArray(users)) users = [];
    return seeds.flatMap(seed => {
      const user = users.find(u => u && u.id === seed.id && u.role === 'counselor');
      if (user?.status === 'disabled') return [];
      const person = { ...seed, expertise: [...seed.expertise] };
      if (user?.status !== 'active') return [person];
      const profile = user.counselorProfile || {};
      person.name = clean(user.name, 150) || seed.name;
      person.bio = clean(profile.bio, 1500) || seed.bio;
      person.qualification = clean(profile.qualification, 150) || seed.qualification;
      person.organization = clean(profile.organization, 150);
      person.experience = clean(profile.experience, 500) || seed.experience;
      person.email = clean(user.email, 254);
      const specialties = clean(profile.specialties, 300);
      if (specialties) person.expertise = specialties.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
      return [person];
    });
  }
  window.CampusMindPublicProfiles = Object.freeze({ read });
})();
