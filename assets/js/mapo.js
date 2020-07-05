"use strict";


let pages = [
    ['   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', 'a1 ', '   ', '   '],
    ['   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', 'a2 ', 'a3 ', 'a4 ', '   ', '   '],
    ['   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', 'a5 ', 'a6 ', 'a7 ', 'a8 ', '   ', '   '],
    ['   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', 'a9 ', 'a10', 'a11', 'a12', 'a13', 'a14', 'a15'],
    ['   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', 'a16', '   ', '   ', '   ', '   ', 'a17', 'a18', 'a19', 'a20', 'a21', 'a22', 'a23', 'a24', 'a25', '   '],
    ['   ', '   ', '   ', '   ', '   ', '   ', '   ', 'a26', 'a27', 'a28', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', 'a29', 'a30', 'a31', '   ', '   ', '   ', 'a32', 'a33', 'a34', 'a35', 'a36', 'a37', 'a38', 'a39', 'a40', 'a41', '   '],
    ['   ', '   ', '   ', '   ', 'a42', 'a43', 'a44', 'a45', 'a46', 'a47', 'a48', 'a49', '   ', '   ', '   ', '   ', '   ', '   ', 'a50', 'a51', 'a52', 'a53', 'a54', 'a55', 'a56', 'a57', 'a58', 'a59', 'a60', 'a61', 'a62', 'a63', 'a64', 'a65', '   '],
    ['   ', '   ', '   ', '   ', 'a66', 'a67', 'a68', 'a69', 'a70', 'a71', 'a72', 'a73', '   ', 'a74', 'a75', 'a76', 'a77', 'a78', 'a79', 'a80', 'a81', 'a82', 'a83', 'a84', 'a85', 'a86', 'a87', 'a88', 'a89', 'a90', 'a91', 'a92', 'a93', 'a94', '   '],
    ['a95', 'a96', '   ', '   ', '   ', '  1', '  2', '  3', '  4', '  5', '  6', '  7', '  8', '  9', ' 10', ' 11', ' 12', ' 13', ' 14', ' 15', ' 16', ' 17', ' 18', ' 19', ' 20', ' 21', ' 22', ' 23', ' 24', ' 25', ' 26', ' 27', ' 28', '   ', '   '],
    ['a97', 'a98', 'a99', 'b1 ', '   ', ' 29', ' 30', ' 31', ' 32', ' 33', ' 34', ' 35', ' 36', ' 37', ' 38', ' 39', ' 40', ' 41', ' 42', ' 43', ' 44', ' 45', ' 46', ' 47', ' 48', ' 49', ' 50', ' 51', ' 52', ' 53', ' 54', ' 55', ' 56', '   ', '   '],
    ['b2 ', 'b3 ', 'b4 ', 'b5 ', 'b6 ', ' 57', ' 58', ' 59', ' 60', ' 61', ' 62', ' 63', ' 64', ' 65', ' 66', ' 67', ' 68', ' 69', ' 70', ' 71', ' 72', ' 73', ' 74', ' 75', ' 76', ' 77', ' 78', ' 79', ' 80', ' 81', ' 82', ' 83', ' 84', '   ', '   '],
    ['b7 ', 'b8 ', 'b9 ', 'b10', 'b11', ' 85', ' 86', ' 87', ' 88', ' 89', ' 90', ' 91', ' 92', ' 93', ' 94', ' 95', ' 96', ' 97', ' 98', ' 99', '100', '101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '   ', '   '],
    ['b12', 'b13', 'b14', 'b15', 'b16', '113', '114', '115', '116', '117', '118', '119', '120', '121', '122', '123', '124', '125', '126', '127', '128', '129', '130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '140', '   ', '   '],
    ['   ', 'b17', 'b18', 'b19', 'b20', '141', '142', '143', '144', '145', '146', '147', '148', '149', '150', '151', '152', '153', '154', '155', '156', '157', '158', '159', '160', '161', '162', '163', '164', '165', '166', '167', '168', '   ', '   '],
    ['   ', 'b21', 'b22', 'b23', 'b24', '169', '170', '171', '172', '173', '174', '175', '176', '177', '178', '179', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189', '190', '191', '192', '193', '194', '195', '196', '   ', '   '],
    ['   ', '   ', 'b25', 'b26', 'b27', '197', '198', '199', '200', '201', '202', '203', '204', '205', '206', '207', '208', '209', '210', '211', '212', '213', '214', '215', '216', '217', '218', '219', '220', '221', '222', '223', '224', '   ', '   '],
    ['   ', '   ', '   ', '   ', '   ', '225', '226', '227', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237', '238', '239', '240', '241', '242', '243', '244', '245', '246', '247', '248', '249', '250', '251', '252', '   ', '   '],
    ['   ', '   ', '   ', '   ', '   ', '253', '254', '255', '256', '257', '258', '259', '260', '261', '262', '263', '264', '265', '266', '267', '268', '269', '270', '271', '272', '273', '274', '275', '276', '277', '278', '279', '280', '   ', '   '],
    ['   ', '   ', '   ', '   ', '   ', '281', '282', '283', '284', '285', '286', '287', '288', '289', '290', '291', '292', '293', '294', '295', '296', '297', '298', '299', '300', '301', '302', '303', '304', '305', '306', '307', '308', '   ', '   '],
    ['   ', '   ', '   ', '   ', '   ', '309', '310', '311', '312', '313', '314', '315', '316', '317', '318', '319', '320', '321', '322', '323', '324', '325', '326', '327', '328', '329', '330', '331', '332', '333', '334', '335', '336', '   ', '   '],
    ['   ', '   ', '   ', '   ', '   ', '337', '338', '339', '340', '341', '342', '343', '344', '345', '346', '347', '348', '349', '350', '351', '352', '353', '354', '355', '356', '357', '358', '359', '360', '361', '362', '363', '364', '365', '366'],
    ['   ', '   ', '   ', '   ', '   ', '367', '368', '369', '370', '371', '372', '373', '374', '375', '376', '377', '378', '379', '380', '381', '382', '383', '384', '385', '386', '387', '388', '389', '390', '391', '392', '393', '394', '395', '396'],
    ['   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '397', '398', '399', '400', '401', '402', '403', '404', '405', '406', '407', '408', '409', '410', '411', '412', '413', '414', '415', '416', '417', '418', '419', '   ', '   '],
    ['   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '420', '421', '422', '423', '   ', '   ', '   ', '424', '425', '426', '427', '428', '429', '430', '431', '432', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ', '   ']];

// This is the magic!
let w = math.matrix([[ 1.30661205e+01,  1.59621691e+01],
                     [ 4.00051276e-04,  5.83493179e-08],
                     [ 2.65728906e-08, -5.56036132e-04]]);

let origin = [-23.55039, -46.63395]; // Praça da Sé

let vcoord_page = pages.map(
    row=>row.map(
        page=>{
            page = page.trim().toUpperCase();
            return (page.length == 0) ? null : page;
        }));

let page_vcoord = {};

vcoord_page.forEach(
    (row, i)=>row.forEach(
        (page, j)=>{page && (page_vcoord[page.toString()] = [i, j])}
    ));

let alphabet = 'ABCDEFHJLMNOPRSTUVXZ';
let n_alphabet = alphabet.length;

let alphabet_inv = {};
alphabet.split('').forEach((a, i)=>alphabet_inv[a] = i);

function vcoord_from_mapo(page, letter, number) {
    page = page.toUpperCase();
    letter = letter.toUpperCase();

    let y = page_vcoord[page][0] + (number - 0.5) / 30;
    let x = page_vcoord[page][0] + (alphabet_inv[letter] + 0.5) / n_alphabet;
    
    return [y, x];
}

function mapo_from_vcoord(y, x) {
    let i = parseInt(y);
    let j = parseInt(x);

    let rest_i = y - i;
    let rest_j = x - j;

    let number = Math.round(rest_i * 30 + 0.5);
    let letter = alphabet[Math.round(rest_j * n_alphabet - 0.5)];

    return [vcoord_page[i][j], letter, number];
}

function coord_to_meters(origin, dest) {
    let k = 40008000 / 360;
    let f = x=>(math.cos(x / 180 * math.PI) * k);

    let mean_lat = (-2 * (180 * k * (Math.sin(Math.PI * origin[0]/180) - Math.sin(Math.PI * dest[0]/180))) /
                    (math.PI * (f(origin[0]) + f(dest[0]))));

    let delta = [origin[0] - dest[0], origin[1] - dest[1]];

    return [delta[0] * k,
            delta[1] * f(mean_lat)];
}

function mapo_from_coord(y, x) {
    let real_delta = coord_to_meters(origin, [y, x]);
    let r = math.matrix([1, real_delta[0], real_delta[1]]);
    let v = math.multiply(r, w).toArray();

    return mapo_from_vcoord(v[0], v[1]);
}

function success(position) {
    let pos = mapo_from_coord(position.coords.latitude, position.coords.longitude);
    
    document.getElementById('coords').innerText = 'A sua posição no guia é: ' + pos.join(' ');
}

function fail() {
    document.getElementById('coords').innerText =
	'Se você permitir a geolocalização, ligar o seu GPS e recarregar a página, ' +
	'eu te mostro aqui em que posição no guia você está!'
}

navigator.geolocation.watchPosition(success, fail);
