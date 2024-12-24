// Initialize Supabase client
const supabaseUrl = "https://cqdqanjdrrsokpnjpjpj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZHFhbmpkcnJzb2twbmpwanBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyMjIxNzIsImV4cCI6MjA0ODc5ODE3Mn0.mldA8vWRcbH-vikkKDBz836-l8p_2lhKkP9STZ1l2b4";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Global variable to store current alternatif data
let currentAlternatifData = null;

// Function to load alternatif detail
async function loadAlternatifDetail(alternatifId) {
    try {
        console.log("Loading alternatif ID:", alternatifId);
        
        const { data, error } = await supabase
            .rpc('get_detail_alternatif', { alternatif_id: alternatifId });
        
        console.log("Raw response:", { data, error });

        if (error) {
            throw error;
        }

        // Make sure we got data back
        if (!data || data.length === 0) {
            throw new Error('Data alternatif tidak ditemukan');
        }

        // Get the first (and should be only) row since we're querying by ID
        const alternatif = data[0];
        currentAlternatifData = alternatif;

        console.log("Processed alternatif data:", alternatif);

        // Update UI elements
        const imgAlternatif = document.getElementById('imgAlternatif');
        if (alternatif.url_gambar) {
            imgAlternatif.src = alternatif.url_gambar;
            imgAlternatif.style.display = 'block';
        } else {
            imgAlternatif.style.display = 'none';
        }

        // Update text fields
        document.getElementById('namaAlternatif').value = alternatif.nama_alternatif || '';
        document.getElementById('kodeAlternatif').value = alternatif.kode_alternatif || '';

        // Update kriteria
        const kriteriaContainer = document.getElementById('kriteriaContainer');
        kriteriaContainer.innerHTML = '<h7>Kriteria Alternatif</h7>';

        if (alternatif.kriteria && alternatif.kriteria.length > 0) {
            const table = document.createElement('table');
            table.className = 'table table-bordered mt-3';
            
            // Create table header
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th>Kode</th>
                    <th>Kriteria</th>
                    <th>Keterangan</th>
                    <th>Nilai</th>
                </tr>
            `;
            table.appendChild(thead);

            // Create table body
            const tbody = document.createElement('tbody');
            alternatif.kriteria.forEach(kriteria => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${kriteria.kode_kriteria}</td>
                    <td>${kriteria.nama_kriteria}</td>
                    <td>${kriteria.keterangan || '-'}</td>
                    <td>${kriteria.nilai}</td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            kriteriaContainer.appendChild(table);
        } else {
            kriteriaContainer.innerHTML += '<p class="text-muted mt-3">Tidak ada kriteria untuk alternatif ini.</p>';
        }

        // Setup button listeners
        setupButtonListeners(alternatifId);

    } catch (error) {
        console.error('Error in loadAlternatifDetail:', error);
        alert('Gagal memuat detail alternatif: ' + error.message);
    }
}

// Function to setup button event listeners
function setupButtonListeners(alternatifId) {
    const editButton = document.getElementById('editButton');
    const deleteButton = document.getElementById('deleteButton');

    // Edit button handler
    editButton.addEventListener('click', () => {
        window.location.href = `edit_alternatif.html?id=${alternatifId}`;
    });

    // Delete button handler
    deleteButton.addEventListener('click', async () => {
        if (confirm('Apakah Anda yakin ingin menghapus alternatif ini?')) {
            try {
                // Delete related records in nilai_alternatif first
                const { error: nilaiError } = await supabase
                    .from('nilai_alternatif')
                    .delete()
                    .eq('kode_alternatif', currentAlternatifData.kode_alternatif);

                if (nilaiError) throw nilaiError;

                // Delete related records in wp_vektor_s
                const { error: vektorSError } = await supabase
                    .from('wp_vektor_s')
                    .delete()
                    .eq('kode_alternatif', currentAlternatifData.kode_alternatif);

                if (vektorSError) throw vektorSError;

                // Delete related records in wp_vektor_v
                const { error: vektorVError } = await supabase
                    .from('WP_vektor_v')
                    .delete()
                    .eq('kode_alternatif', currentAlternatifData.kode_alternatif);

                if (vektorVError) throw vektorVError;

                // Then delete the alternatif
                const { error: alternatifError } = await supabase
                    .from('alternatif')
                    .delete()
                    .eq('id', alternatifId);

                if (alternatifError) throw alternatifError;

                // Delete image from storage if exists
                if (currentAlternatifData.url_gambar) {
                    const imagePath = currentAlternatifData.url_gambar.split('/').pop();
                    const { error: storageError } = await supabase.storage
                        .from('fp_spk')
                        .remove([`alternatif/${imagePath}`]);

                    if (storageError) console.error('Error deleting image:', storageError);
                }

                alert('Alternatif berhasil dihapus');
                window.location.href = 'alternatif.html';

            } catch (error) {
                console.error('Error deleting alternatif:', error);
                alert('Gagal menghapus alternatif: ' + error.message);
            }
        }
    });
    }

// Get alternatif ID from URL and load details when page loads
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const alternatifId = urlParams.get('id');
    
    if (alternatifId) {
        loadAlternatifDetail(alternatifId);
    } else {
        alert('ID Alternatif tidak ditemukan di URL');
        window.location.href = 'alternatif.html';
    }
}); 