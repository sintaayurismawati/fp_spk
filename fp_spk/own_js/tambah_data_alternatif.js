// Initialize Supabase client
const supabaseUrl = "https://cqdqanjdrrsokpnjpjpj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZHFhbmpkcnJzb2twbmpwanBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyMjIxNzIsImV4cCI6MjA0ODc5ODE3Mn0.mldA8vWRcbH-vikkKDBz836-l8p_2lhKkP9STZ1l2b4";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Function to fetch all criteria from the database
async function fetchKriteria() {
    try {
        const { data: kriteria, error } = await supabase.rpc('get_kriteria_with_bobot');
        if (error) throw error;
        return kriteria;
    } catch (error) {
        console.error('Error fetching kriteria:', error);
        return [];
    }
}

// Function to fetch scale data for a specific criterion
async function fetchScaleData(kodeKriteria) {
    try {
        const { data, error } = await supabase
            .from('skala_kriteria')
            .select('*')
            .eq('kode_kriteria', kodeKriteria)
            .order('urutan_skala', { ascending: true });
        if (error) throw error;
        return data;
    } catch (error) {
        console.error(`Error fetching scale data for ${kodeKriteria}:`, error);
        return [];
    }
}

// Function to create dropdown fields for each criterion
async function createKriteriaInputs(kriteria) {
    const container = document.getElementById('kriteria-container');
    container.innerHTML = ''; // Clear existing content

    const seenKriteria = new Set(); // Untuk melacak kriteria yang sudah ditambahkan

    for (let i = 0; i < kriteria.length; i++) {
        const item = kriteria[i];
        if (seenKriteria.has(item.id)) {
            console.warn(`Duplikasi kriteria ditemukan: ${item.nama_kriteria}`);
            continue; // Lewati kriteria yang sudah diproses
        }
        seenKriteria.add(item.id);

        const scaleData = await fetchScaleData(item.kode_kriteria);

        const formGroup = document.createElement('div');
        formGroup.className = 'form-group mt-4';

        const label = document.createElement('label');
        label.htmlFor = `kriteria_${item.id}`;
        label.textContent = item.nama_kriteria;

        const select = document.createElement('select');
        select.className = 'form-control';
        select.id = `kriteria_${item.id}`;
        select.name = `kriteria_${item.id}`;
        select.required = true;

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = `Pilih ${item.nama_kriteria}`;
        defaultOption.selected = true;
        defaultOption.disabled = true;
        select.appendChild(defaultOption);

        scaleData.forEach(scale => {
            const option = document.createElement('option');
            option.value = scale.urutan_skala;
            option.textContent = scale.keterangan;
            select.appendChild(option);
        });

        const helpText = document.createElement('small');
        helpText.className = 'form-text text-muted';
        helpText.textContent = `Pilih nilai untuk ${item.nama_kriteria}`;

        formGroup.appendChild(label);
        formGroup.appendChild(select);
        formGroup.appendChild(helpText);
        container.appendChild(formGroup);
    }
}

// Validate form before submission
function validateForm() {
    const namaAlternatif = document.getElementById('namaAlternatif').value;
    if (!namaAlternatif.trim()) {
        alert('Nama Alternatif harus diisi!');
        return false;
    }

    const selects = document.querySelectorAll('[id^="kriteria_"]');
    for (const select of selects) {
        if (!select.value) {
            alert('Semua kriteria harus dipilih!');
            return false;
        }
    }
    return true;
}

// Function to handle form submission
async function handleSubmit(event) {
    event.preventDefault();

    // Validate form
    if (!validateForm()) {
        return;
    }

    try {
        const namaAlternatif = document.getElementById('namaAlternatif').value;
        const gambarFile = document.getElementById('uploadGambar').files[0];

        let imageUrl = '';
        if (gambarFile) {
            // Upload image to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('fp_spk')
                .upload(`alternatif/${Date.now()}-${gambarFile.name}`, gambarFile);

            if (uploadError) {
                throw new Error('Gagal mengunggah gambar: ' + uploadError.message);
            }

            // Get public URL for the uploaded image
            const { data: publicUrlData } = supabase.storage
                .from('fp_spk')
                .getPublicUrl(`/${uploadData.path}`);

            imageUrl = publicUrlData.publicUrl;
        }

        // Insert alternatif data into Supabase
        const { data: alternatif, error: alternatifError } = await supabase
            .from('alternatif')
            .insert([
                {
                    nama_alternatif: namaAlternatif,
                    url_gambar: imageUrl
                }
            ])
            .select()
            .single();

        if (alternatifError) {
            throw new Error('Gagal menyimpan data alternatif: ' + alternatifError.message);
        }

        // Insert nilai kriteria with the new alternatif ID
        await insertNilaiKriteria(alternatif.id);

        alert('Data alternatif berhasil disimpan!');
        window.location.href = 'alternatif.html';

    } catch (error) {
        console.error('Error lengkap:', error);
        alert(error.message || 'Terjadi kesalahan saat menyimpan data');
    }
}

// Function to insert criteria values
async function insertNilaiKriteria(alternatifId) {
    try {
        if (!alternatifId) {
            console.error('ID alternatif tidak tersedia');
            return;
        }

        // Fetch kode_alternatif dari tabel alternatif
        const { data: alternatifData, error: alternatifError } = await supabase
            .from('alternatif')
            .select('kode_alternatif')
            .eq('id', alternatifId)
            .single();

        if (alternatifError || !alternatifData) {
            console.error('Error fetching kode alternatif:', alternatifError || 'Tidak ditemukan');
            return;
        }

        const kodeAlternatif = alternatifData.kode_alternatif;

        const kriteriaInserts = [];
        const selects = document.querySelectorAll('[id^="kriteria_"]');

        for (const select of selects) {
            const kriteriaId = parseInt(select.id.split('_')[1]);
            const nilai = parseInt(select.value);

            const { data: kriteriaData, error: kriteriaError } = await supabase
                .from('kriteria')
                .select('kode_kriteria')
                .eq('id', kriteriaId)
                .single();

            if (kriteriaError || !kriteriaData) {
                console.error(`Error fetching kode_kriteria untuk ID ${kriteriaId}`);
                continue;
            }

            kriteriaInserts.push({
                kode_alternatif: kodeAlternatif,
                kode_kriteria: kriteriaData.kode_kriteria,
                nilai: nilai
            });
        }

        if (kriteriaInserts.length > 0) {
            const { error: upsertError } = await supabase
                .from('nilai_alternatif')
                .upsert(kriteriaInserts, { onConflict: ['kode_alternatif', 'kode_kriteria'] });

            if (upsertError) {

                console.error('Error upsert nilai_alternatif:', upsertError);
                return;
            }
        }

        console.log('Nilai kriteria berhasil disimpan untuk kode_alternatif:', kodeAlternatif);

        // Update WP_vektor_s
        await updateWPVektorS(kodeAlternatif);

    } catch (error) {
        console.error('Error inserting nilai kriteria:', error);
    }
}

function prosesAlternatif(alternatif) {
    console.log('Memproses alternatif baru:', alternatif); // Tambahkan di sini
    // Logika untuk memproses alternatif

    let kode_alternatif = alternatif.kode_alternatif;
    // Operasi pembaruan WP_vektor_s
    WP_vektor_s[kode_alternatif] = hitungVektorS(alternatif);
    console.log('Memperbarui WP_vektor_s dengan kode_alternatif:', kode_alternatif); // Tambahkan di sini
}

async function updateWPVektorS(kodeAlternatif) {
    try {
        console.log('Memulai updateWPVektorS untuk kodeAlternatif:', kodeAlternatif);

        // Fetch nilai_alternatif untuk kodeAlternatif tertentu
        const { data: nilaiAlternatifData, error: nilaiAlternatifError } = await supabase
            .from('nilai_alternatif')
            .select('kode_kriteria, nilai')
            .eq('kode_alternatif', kodeAlternatif);

        if (nilaiAlternatifError || !nilaiAlternatifData || nilaiAlternatifData.length === 0) {
            console.warn('Gagal fetch nilai_alternatif atau data kosong:', nilaiAlternatifError);
            return;
        }

        // Fetch data kriteria dan bobot
        const { data: kriteriaData, error: kriteriaError } = await supabase
            .from('kriteria')
            .select('kode_kriteria, jenis_kriteria');

        const { data: bobotData, error: bobotError } = await supabase
            .from('AHP_matriks')
            .select('kode_kriteria, bobot');

        if (kriteriaError || bobotError || !kriteriaData || !bobotData) {
            console.warn('Gagal fetch kriteria atau bobot:', kriteriaError || bobotError);
            return;
        }

        // Kalkulasi nilai pangkat
        const nilaiPangkat = nilaiAlternatifData.map(nilai => {
            const kriteria = kriteriaData.find(k => k.kode_kriteria === nilai.kode_kriteria);
            const bobot = bobotData.find(b => b.kode_kriteria === nilai.kode_kriteria);

            if (!kriteria || !bobot) {
                console.warn(`Data kriteria atau bobot untuk kode_kriteria ${nilai.kode_kriteria} tidak ditemukan`);
                return null;
            }

            const pangkat = kriteria.jenis_kriteria === 'Keuntungan' ? bobot.bobot : -bobot.bobot;
            const nilaiHasil = Math.pow(nilai.nilai, pangkat);

            if (isNaN(nilaiHasil)) {
                console.warn(`Nilai pangkat untuk kriteria ${nilai.kode_kriteria} menghasilkan NaN.`);
                return null;
            }

            return {
                kode_kriteria: nilai.kode_kriteria,
                nilai_pangkat: nilaiHasil
            };
        }).filter(val => val !== null);

        if (nilaiPangkat.length === 0) {
            console.error('Tidak ada nilai pangkat yang valid untuk dihitung.');
            return;
        }

        console.log('nilaiPangkat:', nilaiPangkat);

        // Hitung nilai S
        const nilaiS = nilaiPangkat.reduce((acc, item) => acc * item.nilai_pangkat, 1);

        // Siapkan data untuk di-upsert
        const wpData = nilaiPangkat.slice(0, 4).map(item => ({
            kode_alternatif: kodeAlternatif,
            kode_kriteria: item.kode_kriteria,
            nilai: item.nilai_pangkat,
            s: nilaiS // Nilai S sama untuk semua entri
        }));

        // Upsert data ke wp_vektor_s
        const { data: wpInsertData, error: wpError } = await supabase
            .from('wp_vektor_s')
            .upsert(wpData);

        if (wpError) {
            console.error('Gagal menyimpan data WP_vektor_s:', wpError);
            return;
        }

        console.log('Nilai pangkat berhasil disimpan:', wpInsertData);

    } catch (error) {
        console.error('Terjadi kesalahan saat memperbarui WP_vektor_s:', error);
    }
}

// Initialize form when page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const kriteria = await fetchKriteria();
        await createKriteriaInputs(kriteria);

        const simpanButton = document.getElementById('simpanButton');
        simpanButton.addEventListener('click', handleSubmit);
    } catch (error) {
        console.error('Error initializing form:', error);
        alert('Terjadi kesalahan saat memuat form');
    }
});