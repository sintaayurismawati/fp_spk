// Initialize Supabase client
const supabaseUrl = "https://cqdqanjdrrsokpnjpjpj.supabase.co";
const supabaseKey =  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZHFhbmpkcnJzb2twbmpwanBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyMjIxNzIsImV4cCI6MjA0ODc5ODE3Mn0.mldA8vWRcbH-vikkKDBz836-l8p_2lhKkP9STZ1l2b4";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Function to fetch existing alternatif by ID
async function fetchAlternatif(id) {
    try {
        const { data: alternatif, error } = await supabase
            .from('alternatif')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return alternatif;
    } catch (error) {
        console.error('Error fetching alternatif:', error);
        alert('Terjadi kesalahan saat memuat data alternatif.');
        return null;
    }
}

// Function to fetch all kriteria from the database
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

// Function to create dropdown fields for each criteria
async function createKriteriaInputs(kriteria) {
    const container = document.getElementById('kriteria-container');
    container.innerHTML = ''; // Clear existing content

    for (let i = 0; i < kriteria.length; i++) {
        const item = kriteria[i];
        const kodeKriteria = `C${i + 1}`; // Generate code C1, C2, etc.
        const scaleData = await fetchScaleData(kodeKriteria);

        const formGroup = document.createElement('div');
        formGroup.className = 'form-group mt-4';

        const label = document.createElement('label');
        label.htmlFor = `kriteria_${item.kode_kriteria}`;
        label.textContent = item.nama_kriteria;

        const select = document.createElement('select');
        select.className = 'form-control';
        select.id = `kriteria_${item.kode_kriteria}`;
        select.name = `kriteria_${item.kode_kriteria}`;
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

// Populate form with existing data when editing
async function populateForm(id) {
    const alternatif = await fetchAlternatif(id);
    if (!alternatif) return;

    document.getElementById('kodeAlternatif').value = alternatif.kode_alternatif;
    document.getElementById('namaAlternatif').value = alternatif.nama_alternatif;

    const kriteria = await fetchKriteria();
    await createKriteriaInputs(kriteria);

    // Fetch nilai alternatif (previously selected values)
    const { data: nilaiData, error } = await supabase
        .from('nilai_alternatif')
        .select('*')
        .eq('kode_alternatif', alternatif.kode_alternatif);

    if (!error && nilaiData) {
        // Set selected values for each dropdown
        nilaiData.forEach(nilai => {
            const select = document.getElementById(`kriteria_${nilai.kode_kriteria}`);
            if (select) {
                select.value = nilai.nilai; // Set the selected value
            }
        });
    } else {
        console.error('Error fetching nilai_alternatif:', error);
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

    // Konfirmasi sebelum menyimpan
    const confirmation = confirm("Apakah Anda yakin ingin mengubah data?");
    if (!confirmation) {
        return;
    }

    // Validate form
    if (!validateForm()) {
        return;
    }

    const namaAlternatif = document.getElementById('namaAlternatif').value;
    const gambarFile = document.getElementById('gambarUpload').files[0];
    const kodeAlternatif = document.getElementById('kodeAlternatif').value;

    try {
        let updateData = {
            nama_alternatif: namaAlternatif
        };

        // Only handle image upload if a new image was selected
        if (gambarFile) {
            console.log('Uploading image...');
            const filePath = `alternatif/${Date.now()}-${gambarFile.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('fp_spk')
                .upload(filePath, gambarFile);

            if (uploadError) {
                console.error('Upload Error:', uploadError);
                throw new Error('Gagal mengunggah gambar: ' + uploadError.message);
            }

            const { data: publicUrlData } = supabase.storage
                .from('fp_spk')
                .getPublicUrl(filePath);

            updateData.url_gambar = publicUrlData.publicUrl;
            console.log('Image uploaded successfully:', updateData.url_gambar);
        }

        console.log('Updating alternatif data...', kodeAlternatif);
        const { data: alternatif, error: alternatifError } = await supabase
            .from('alternatif')
            .update(updateData)
            .eq('kode_alternatif', kodeAlternatif)
            .select()
            .single();

        if (alternatifError) {
            console.error('Alternatif Error:', alternatifError);
            throw new Error('Gagal menyimpan data alternatif: ' + alternatifError.message);
        }

        console.log('Alternatif updated:', alternatif);

        // Update nilai kriteria using kode_alternatif
        console.log('Updating nilai kriteria...');
        await insertNilaiKriteria(kodeAlternatif);

        alert('Data alternatif berhasil diperbarui!');
        window.location.href = 'alternatif.html';

    } catch (error) {
        console.error('Error lengkap:', error);
        alert(error.message || 'Terjadi kesalahan saat menyimpan data');
    }
}

// Function to insert updated criteria values
async function insertNilaiKriteria(kodeAlternatif) {
    try {
        if (!kodeAlternatif) {
            throw new Error('Kode Alternatif tidak ditemukan');
        }

        // First, fetch all kriteria to get their mapping
        const { data: kriteriaData, error: kriteriaError } = await supabase
            .from('kriteria')
            .select('id, kode_kriteria');

        if (kriteriaError) {
            throw new Error('Gagal mendapatkan data kriteria');
        }

        const kriteriaInserts = [];
        const selects = document.querySelectorAll('[id^="kriteria_"]');
        
        selects.forEach((select) => {
            if (!select.value) {
                throw new Error(`Nilai untuk ${select.options[0].text} harus dipilih`);
            }
            
            // Extract the kode_kriteria directly from the select id
            // The select id format is "kriteria_C1", "kriteria_C2", etc.
            const kodeKriteria = select.id.split('_')[1];
            const nilai = parseInt(select.value);

            // Find the matching kriteria
            const matchingKriteria = kriteriaData.find(k => k.kode_kriteria === kodeKriteria);
            if (!matchingKriteria) {
                throw new Error(`Kriteria dengan kode ${kodeKriteria} tidak ditemukan`);
            }

            kriteriaInserts.push({
                kode_alternatif: kodeAlternatif,
                kode_kriteria: kodeKriteria,
                nilai: nilai
            });
        });

        // First, delete existing values
        const { error: deleteError } = await supabase
            .from('nilai_alternatif')
            .delete()
            .eq('kode_alternatif', kodeAlternatif);

        if (deleteError) {
            throw new Error('Gagal menghapus nilai kriteria lama');
        }

        // Then insert new values
        const { data, error: nilaiError } = await supabase
            .from('nilai_alternatif')
            .insert(kriteriaInserts)
            .select();

        if (nilaiError) {
            throw new Error(nilaiError.message || 'Gagal menyimpan nilai kriteria ke database');
        }

        console.log("Data berhasil diupdate:", data);

    } catch (error) {
        console.error('Error lengkap:', error);
        throw new Error(error.message || 'Terjadi kesalahan saat menyimpan nilai kriteria');
    }
}

// Initialize form when page loads
document.addEventListener('DOMContentLoaded', async () => {
    const alternatifId = new URLSearchParams(window.location.search).get('id');
    if (alternatifId) {
        document.getElementById('kodeAlternatif').value = alternatifId;
        await populateForm(alternatifId);
    }

    const simpanButton = document.getElementById('simpanButton');
    simpanButton.addEventListener('click', handleSubmit); // Pastikan listener aktif
});
