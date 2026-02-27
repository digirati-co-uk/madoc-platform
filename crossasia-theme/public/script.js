/*try {
  fetch('https://crossasia.org/?type=1001', {
    credentials: 'include',
  })
    .then(r => r.text())
    .then(r => {
      if (r) {
        document.querySelector('#xa-header').innerHTML = r;
      }
    })
    .catch(err => {
      // do nothing.
    });
} catch (e) {
  //
}*/


/*$(function() {
		$.ajax({
			url: "https://crossasia.org/",
			// page type 1001 delivers the menu only
			data: {
				type: '1001'
			},
			// send session information
			xhrFields: {
				withCredentials: true
			},
			// insert header after successfull query
			success: function(data) {
				$("#xa-header").replaceWith(data);
			}
		});
	});*/
	

var _paq = window._paq = window._paq || [];
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var u="https://webstats.sbb.berlin/";
    _paq.push(['setTrackerUrl', u+'matomo.php']);
    _paq.push(['setSiteId', '77']);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.type='text/javascript'; g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
  })();	


    /*if(
      window.innerWidth >= 768 &&
      !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    {
      jQuery('#navbar .dropdown > a').click(function() {
        location.href = this.href;
      });
    }*/

    // Form data must be send as anchor params to itr search client a
    $("#search-form-itr-a").submit(function() {
      var href = $(this).attr("action");
      var target = $(this).attr("target");
      var query = $(this).find('input[name="q"]').val();
      if(target)
        window.open(href+'#/search?q='+query, target);
      else
        window.location.href = href+'#/search?q='+query;
      return false;
    });
	
	
    /*
     * Add a window event listener that reacts on viewport size changes.
     */
    /*window.addEventListener('resize', function() {
      if(window.innerWidth < 768) {
        jQuery('#navbar .dropdown > a').off('click');
      } else {
        jQuery('#navbar .dropdown > a').off('click').click(function() {
          location.href = this.href;
        });
      }
    });*/
	
function extractWordAfterUrl() {
  // Get the current URL
  const currentUrl = window.location.href;
  
  // Define the pattern to search for
  const pattern = 'https://iiif.crossasia.org/s/';
  
  // Find the position of the pattern in the URL
  const patternIndex = currentUrl.indexOf(pattern);
  
  // If pattern is found
  if (patternIndex !== -1) {
    // Calculate the start position of the word (after the pattern)
    const wordStart = patternIndex + pattern.length;
    
    // Find the end of the word (either at next slash or end of URL)
    let wordEnd = currentUrl.indexOf('/', wordStart);
    if (wordEnd === -1) {
      wordEnd = currentUrl.length;
    }
    
    // Extract the word
    const word = currentUrl.substring(wordStart, wordEnd);
    
    return word;
  }
  
  // Return null if pattern not found
  return null;
}


function getIdValueDTAB() {
  const idElement = Array.from(document.querySelectorAll('td.MetaDataKey-sc-1xb6l3t-1 span'))
    .find(el => el.textContent.trim() === 'DTAB document ID');
  
  return idElement 
    ? idElement.closest('tr').querySelector('td.MetaDataValue-sc-1xb6l3t-2 span').textContent.trim() 
    : null;
}

function getIdValueDLLM() {
  const idElement = Array.from(document.querySelectorAll('td.MetaDataKey-sc-1xb6l3t-1 span'))
    .find(el => el.textContent.trim() === 'DLLM no.');
  
  return idElement 
    ? idElement.closest('tr').querySelector('td.MetaDataValue-sc-1xb6l3t-2 span').textContent.trim() 
    : null;
}

function getIdValueLANNA() {
  const idElement = Array.from(document.querySelectorAll('td.MetaDataKey-sc-1xb6l3t-1 span'))
    .find(el => el.textContent.trim() === 'Lanna no.');
  
  return idElement 
    ? idElement.closest('tr').querySelector('td.MetaDataValue-sc-1xb6l3t-2 span').textContent.trim() 
    : null;
}

function getIdValueTURFAN() {
  const idRow = Array.from(document.querySelectorAll('tr.MetadataContainer-sc-1xb6l3t-3'))
    .find(row => {
      const keyCell = row.querySelector('td.MetaDataKey-sc-1xb6l3t-1 span');
      return keyCell?.textContent.trim() === 'Identifier';
    });

  if (!idRow) return null;

  // Get the first span inside the value cell (handles both nested and direct cases)
  const firstValueSpan = idRow.querySelector('td.MetaDataValue-sc-1xb6l3t-2 span:first-child');
  return firstValueSpan?.textContent.trim() || null;
}
	
function getIdValueSUGAWARA() {
  const idRow = Array.from(document.querySelectorAll('tr.MetadataContainer-sc-1xb6l3t-3'))
    .find(row => {
      const keyCell = row.querySelector('td.MetaDataKey-sc-1xb6l3t-1 span');
      return keyCell?.textContent.trim() === 'Title / Document codes';
    });

  if (!idRow) return null;

  // Get the first span inside the value cell (handles both nested and direct cases)
  const firstValueSpan = idRow.querySelector('td.MetaDataValue-sc-1xb6l3t-2 span:first-child');
  return firstValueSpan?.textContent.trim() || null;
}
	
 
 $('body').click(function(e) {
	var target = $(e.target)
    if (target.is(".bmJQXu a s")) {
    	var iiif = document.getElementsByClassName("kmKGLW")[0];
 		var iiif_url = document.querySelector('.bmJQXu a').href;
    	e.stopImmediatePropagation()
    	e.preventDefault()
    	$(target).attr('href', iiif_url+iiif)
    	//window.open("https://iiif2pdf.crossasia.org/?manifest="+iiif, '_blank')
		
		var id_link ="";
		var urlLink = extractWordAfterUrl();
		
		if (urlLink=='dtab') {
			id_link = getIdValueDTAB();
		} else if (urlLink=='dllm') {
			id_link = getIdValueDLLM();
		} else if (urlLink=='lanna') {
			urlLink = "dlntm";
			id_link = getIdValueLANNA();
		} else if (urlLink=='turfan') {
			id_link = getIdValueTURFAN();
			id_link= id_link.replace(/\s+/g, '');
		
		const fullUrl = window.location.href;	
			if (fullUrl.includes('10715')) {
				id_link = 'akten1';
			} else if (fullUrl.includes('10713')) {
				id_link = 'akten2';
			} else if (fullUrl.includes('10714')) {
				id_link = 'akten3';
			} else if (fullUrl.includes('10716')) {
				id_link = 'akten4';
			} else if (fullUrl.includes('10726')) {
				id_link = 'akten5';
			} else if (fullUrl.includes('10719')) {
				id_link = 'akten6';
			} else if (fullUrl.includes('10724')) {
				id_link = 'akten7';
			} else if (fullUrl.includes('10723')) {
				id_link = 'akten8';
			} else if (fullUrl.includes('10725')) {
				id_link = 'akten9';
			}else if (fullUrl.includes('10720')) {
				id_link = 'akten10';
			}else if (fullUrl.includes('10722')) {
				id_link = 'akten11';
			}else if (fullUrl.includes('10728')) {
				id_link = 'akten12';
			}else if (fullUrl.includes('10733')) {
				id_link = 'akten13';
			}else if (fullUrl.includes('10721')) {
				id_link = 'akten14';
			}else if (fullUrl.includes('10729')) {
				id_link = 'akten15';
			}else if (fullUrl.includes('10717')) {
				id_link = 'akten16';
			}else if (fullUrl.includes('10727')) {
				id_link = 'akten17';
			}else if (fullUrl.includes('10731')) {
				id_link = 'akten18';
			}else if (fullUrl.includes('10730')) {
				id_link = 'akten19';
			}else if (fullUrl.includes('10718')) {
				id_link = 'akten20';
			}else if (fullUrl.includes('10732')) {
				id_link = 'akten21';
			}
		} else if (urlLink=='kashgar_documents') {
			urlLink = "sugawara";
			id_link = getIdValueSUGAWARA();
			id_link = id_link.replace("KCDC_","").replace("-","");
		}
		
		window.open("https://iiif2pdf.crossasia.org/?manifest="+"https://crossasia.org/resources/apps/iiif-viewer/manifests/"+urlLink+"/"+id_link+".json", '_blank')
		
		
    }
	if (target.is(".bmJQXu a")) {
	    if (document.getElementsByClassName("hKCCGE")[0].title.includes("Kundeling archives ID")) {
	    
	        const numbersArray = [
    '1036', '1067', '1078', '1082', '109', '1111', '1134', '1159', '117', '118', '1201', '1215', '1262',
    '1298', '1309', '1314', '1340', '136', '1367', '137', '1370', '1379', '138', '1387', '139', '1418',
    '1421', '1424', '1427', '1429', '1430', '1432', '1433', '1435', '1436', '1437', '1438', '1440',
    '1441', '1442', '1443', '1445', '1446', '1448', '1449', '1451', '1452', '1454', '1455', '1456',
    '1458', '1459', '1460', '1461', '1463', '1464', '1466', '1467', '1469', '1470', '1472', '1473',
    '1475', '1476', '1478', '1479', '1480', '1481', '1482', '1484', '1485', '1487', '1488', '1489',
    '1490', '1491', '1492', '1493', '1498', '1499', '1500', '1505', '1506', '1507', '1512', '1513',
    '1514', '1519', '1520', '1521', '1522', '1527', '1528', '1529', '1530', '1535', '1536', '1537',
    '1542', '1543', '1544', '1549', '1550', '1551', '1556', '1557', '1558', '1563', '1564', '1565',
    '1570', '1571', '1572', '1577', '1578', '1579', '1580', '1584', '1585', '1586', '1587', '1591',
    '1592', '1593', '1594', '1598', '1599', '1600', '1601', '1602', '1603', '1604', '1605', '1608',
    '1609', '161', '1610', '1611', '1612', '1615', '1616', '1617', '1618', '1619', '1621', '1622',
    '1623', '1624', '1625', '1626', '1627', '1628', '1630', '1631', '1632', '1633', '1634', '1635',
    '1636', '1637', '1638', '1639', '1640', '1641', '1642', '1644', '1645', '1646', '1647', '1648',
    '1649', '1650', '1652', '1653', '1654', '1655', '1656', '1657', '1659', '1660', '1661', '1662',
    '1663', '1664', '1666', '1667', '1668', '1669', '1670', '1671', '1673', '1674', '1675', '1676',
    '1677', '1678', '1679', '168', '1680', '1682', '1683', '1684', '1685', '1686', '1687', '1688',
    '1689', '169', '1691', '1692', '1693', '1694', '1695', '1696', '1697', '1699', '170', '1700',
    '1701', '1702', '1703', '1704', '1706', '1707', '1708', '1709', '1710', '1711', '1712', '1714',
    '1715', '1716', '1717', '1718', '1719', '1720', '1722', '1723', '1724', '1725', '1726', '1727',
    '1729', '173', '1730', '1731', '1732', '1733', '1734', '1736', '1737', '1738', '1739', '1740',
    '1741', '1743', '1744', '1745', '1746', '1747', '1748', '1749', '1750', '1751', '1753', '1754',
    '1755', '1756', '1757', '1758', '1759', '1760', '1761', '1762', '1763', '1764', '1765', '1766',
    '1767', '1768', '1769', '1770', '1771', '1772', '1773', '1774', '1775', '1776', '1777', '1778',
    '1779', '1780', '1781', '1782', '1783', '1784', '1785', '1786', '1787', '1788', '1789', '1790',
    '1791', '1792', '1793', '1794', '1795', '1796', '1797', '1798', '1799', '1800', '1801', '1802',
    '1803', '1804', '1805', '1806', '1807', '1808', '1809', '1810', '1811', '1812', '1813', '1814',
    '1815', '1816', '1817', '1818', '1819', '1820', '1821', '1822', '1823', '1824', '1825', '1826',
    '1827', '1828', '1829', '1830', '1831', '1832', '1833', '1834', '1835', '1836', '1837', '1838',
    '1839', '1840', '1841', '1842', '1843', '1844', '1845', '1846', '1847', '1848', '1849', '1850',
    '1851', '1852', '1853', '1854', '1855', '1856', '1857', '1858', '1859', '1860', '1861', '1862',
    '1863', '1864', '1865', '1866', '1867', '1868', '1869', '1870', '1871', '1872', '1873', '1874',
    '1875', '1876', '1877', '1878', '1879', '1880', '1881', '1882', '1883', '1884', '1885', '1886',
    '1887', '1888', '1889', '1890', '1891', '1892', '1893', '1894', '1895', '1896', '1897', '1898',
    '1899', '1900', '1901', '1902', '1903', '1904', '1905', '1906', '1907', '1908', '1909', '1910',
    '1911', '1912', '1913', '1914', '1915', '1916', '1917', '1918', '1919', '1920', '1921', '1922',
    '1923', '1924', '1925', '1926', '1927', '1928', '1929', '1930', '1931', '1932', '1933', '1934',
    '1935', '1936', '1937', '1938', '1939', '1940', '1941', '1942', '1943', '1944', '1945', '1946',
    '1947', '1948', '1949', '1950', '1951', '1952', '1953', '1954', '1955', '1956', '1957', '1958',
    '1959', '1960', '1961', '1962', '1963', '1964', '1965', '1966', '1967', '1968', '1969', '1970',
    '1971', '1972', '1973', '1974', '1975', '1976', '1977', '1978', '1979', '1980', '1981', '1982',
    '1983', '1984', '1985', '1986', '1987', '1988', '1989', '1990', '1991', '1992', '1993', '1994',
    '1995', '1996', '1997', '1998', '1999', '2000', '2001', '2002', '2003', '2004', '2005', '2006',
    '2007', '2008', '2009', '201', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017',
    '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029',
    '2030', '2031', '2032', '2033', '2034', '2035', '2036', '2037', '2038', '2039', '2040', '2041',
    '2042', '2043', '2044', '2045', '2046', '2047', '2048', '2049', '2050', '2051', '2052', '2053',
    '2054', '2055', '2056', '2057', '2058', '2059', '2060', '2061', '2062', '2063', '2064', '2065',
    '2066', '2067', '2068', '2069', '2070', '2071', '2072', '2073', '2074', '2075', '2076', '2077',
    '2078', '2079', '2080', '2081', '2082', '2083', '2084', '2085', '2086', '2087', '2088', '2089',
    '2090', '2091', '2092', '2093', '2094', '2095', '2096', '2097', '2098', '2099', '2100', '2101',
    '2102', '2103', '2104', '2105', '2106', '2107', '2108', '2109', '2110', '2111', '2112', '2113',
    '2114', '2115', '2116', '2117', '2118', '2119', '2120', '2121', '2122', '2123', '2124', '2125',
    '2126', '2127', '2128', '2129', '2130', '2131', '2132', '2133', '2134', '2135', '2136', '2137',
    '2138', '2139', '2140', '2141', '2142', '2143', '2144', '2145', '2146', '2147', '2148', '2149',
    '2150', '2151', '2152', '2153', '2154', '2155', '2156', '2157', '2158', '2159', '2160', '2161',
    '2162', '2163', '2164', '2165', '2166', '2167', '2168', '2169', '2170', '2171', '2172', '2173',
    '2174', '2175', '2176', '2177', '2178', '2179', '2180', '2181', '2182', '2183', '2184', '2185',
    '2186', '2187', '2188', '2189', '2190', '2191', '2192', '2193', '2194', '2195', '2196', '2197',
    '2198', '2199', '2200', '2201', '2202', '2203', '2204', '2205', '2206', '2207', '2208', '2209',
    '2210', '2211', '2212', '2213', '2214', '2215', '2216', '2217', '2218', '2219', '2220', '2221',
    '2222', '2223', '2224', '2225', '2226', '2227', '2228', '2229', '2230', '2231', '2232', '2233',
    '2234', '2235', '2236', '2237', '2238', '2239', '2240', '2241', '2242', '2243', '2244', '2245',
    '2246', '2247', '2248', '2249', '2250', '2251', '2252', '2253', '2254', '2255', '2256', '2257',
    '2258', '2259', '2260', '2261', '2262', '2263', '2264', '2265', '2266', '2267', '2268', '2269',
    '2270', '2271', '2272', '2273', '2274', '2275', '2276', '2277', '2278', '2279', '2280', '2281',
    '2282', '2283', '2284', '2285', '2286', '2287', '2288', '2289', '2290', '2291', '2292', '2293',
    '2294', '2295', '2296', '2297', '2298', '2299', '2300', '2301', '2302', '2303', '2304', '2305',
    '2306', '2307', '2308', '2309', '2310', '2311', '2312', '2313', '2314', '2315', '2316', '2317',
    '2318', '2319', '2320', '2321', '2322', '2323', '2324', '2325', '2326', '2327', '2328', '2329',
    '2330', '2331', '2332', '2333', '2334', '2335', '2336', '2337', '2338', '2339', '2340', '2341',
    '2342', '2343', '2344', '2345', '2346', '2347', '2348', '2349', '2350', '2351', '2352', '2353',
    '2354', '2355', '2356', '2357', '2358', '2359', '2360', '2361', '2362', '2363', '2364', '2365',
    '2366', '2367', '2368', '2369', '2370', '2371', '2372', '2373', '2374', '2375', '2376', '2377',
    '2378', '2379', '2380', '2381', '2382', '2383', '2384', '2385', '2386', '2387', '2388', '2389',
    '2390', '2391', '2392', '2393', '2394', '2395', '2396', '2397', '2398', '2399', '2400', '2401',
    '2402', '2403', '2404', '2405', '2406', '2407', '2408', '2409', '2410', '2411', '2412', '2413',
    '2414', '2415', '2416', '2417', '2418', '2419', '2420', '2421', '2422', '2423', '2424', '2425',
    '2426', '2427', '2428', '2429', '2430', '2431', '2432', '2433', '2434', '2435', '2436', '2437',
    '2438', '2439', '2440', '2441', '2442', '2443', '2444', '2445', '2446', '2447', '2448', '2449',
    '2450', '2451', '2452', '2453', '2454', '2455', '2456', '2457', '2458', '2459', '2460', '2461',
    '2462', '2463', '2464', '2465', '2466', '2467', '2468', '2469', '2470', '2471', '2472', '2473',
    '2474', '2475', '2476', '2477', '2478', '2479', '2480', '2481', '2482', '2483', '2484', '2485',
    '2486', '2487', '2488', '2489', '2490', '2491', '2492', '2493', '2494', '2495', '2496', '2497',
    '2498', '2499', '2500', '2501', '2502', '2503', '2504', '2505', '2506', '2507', '2508', '2509',
    '2510', '2511', '2512', '2513', '2514', '2515', '2516', '2517', '2518', '2519', '2520', '2521',
    '2522', '2523', '2524', '2525', '2526', '2527', '2528', '2529', '2530', '2531', '2532', '2533',
    '2534', '2535', '2536', '2537', '2538', '2539', '2540', '2541', '2542', '2543', '2544', '2545',
    '2546', '2547', '2548', '2549', '2550', '2551', '2552', '2553', '2554', '2555', '2556', '2557',
    '2558', '2559', '2560', '2561', '2562', '2563', '2564', '2565', '2566', '2567', '2568', '2569',
    '2570', '2571', '2572', '2573', '2574', '2575', '2576', '2577', '2578', '2579', '2580', '2581',
    '2582', '2583', '2584', '2585', '2586', '2587', '2588', '2589', '2590', '2591', '2592', '2593',
    '2594', '2595', '2596', '2597', '2598', '2599', '2600', '2601', '2602', '2603', '2604', '2605',
    '2606', '2607', '2608', '2609', '2610', '2611', '2612', '2617', '2618', '2619', '2620', '2621',
	'335', '341', '370','371','397','398','399','400','41','42','427','435','447','451','496','497','498','501',
    '505','512','521','560','566','582','583','584','585','586','587','588','589','590','591','679','702','703',
	'704','710','750','804','809','812','831','845','860','881','882','921','949','953','956','957','965','969',
	'97','970','972','974','976','977','983','984','985','986']; 
			var pdf = document.getElementsByClassName("hKCCGE")[0].title.replace("Kundeling archives ID ","").replace(/\(.*/g,"").replace(" ","");
			e.stopImmediatePropagation()
			e.preventDefault()
			$(target).attr('href', "k"+pdf+".pdf")
			
			if (numbersArray.includes(pdf)) {
				alert("No PDF File");
			} else {
				window.open("https://crossasia.org/resources/apps/iiif-viewer/manifests/pdf/k"+pdf+".pdf", '_blank')
			}
			
		 }else {
		    const numbersArray2 =["0017_SBB664","0019_SBB66420019_SBB6642","0186a_SBB6809","0192-0253_SBB6815-6876","0252_SBB6875","0254_SBB6877","0308_SBB6931","0342_SBB6191_S","0367_KHD_KC34_7-8_7-8_1","0369_KHD_S88_x-x_x-x_x","0370_KHD_S88_x-x_x-x_x","0377_KHD_KC61_x-x_x-x_x","0411_KHD_S76_27-28_3-4_3_","0441_KHD_x-x_x-x_x_x","0442_KHD_x-x_x-x_x_x","0443_KHD_x-x_x-x_x_x","0444_KHD_x-x_x-x_x_x","0447_KHD_S128_x-x_x-x_x","0448_KHD_S116_x-x_x-x_x","0449_KHD_S111_x-x_x-x_x","0450_KHD_S117_x-x_x-x_x","0461_KHD_KC78_x-x_x-x_x-SL","0462_KHD_KC74_x-x_x-x_x-SL","0463_KHD_x-x_x-x_xSL","0464_KHD_S123_x-x_x-x_x-SL","0465_KHD_x-x_x-x_x-SL","0466_KHD_S122x-x_x-x_x","0471_KHD_KC79_x-x_x-x_x","0472_KHD_KC72_x-x_x-x_x","0473_KHD_KC80_x-x_x-x_x","0474_KHD_KC76_x-x_x-x_x","0475_KHD_KC77_x-x_x-x_x","0476_KHD_S26_x-x_x-x_x_SL","0477_KHD_KC82_x-x_x-x_x_SL","0478_KHD_x_x-x_x-x_x_SL","0479_KHD_x_x-x_x-x_x_SL","0480_KHD_DP2_x-x_x-x_x_SL","0483_KHD_DP18_x-x_x-x_x","0495_KHD_S62_x_x_x","0502_KHD_S18_x_11_12_SL","0514_KHD_S101_x_x_x","0525_KHD_S22_43_7_4","0526_KHD_S22_43_7_4","0532_KHD_S25_x_x_x","0533_KHD_x_x_x_x","0535_KHD_x_x_x_x_","0538_KHD_x_x_x_x","0540_KHD_S8_x_x_x","0601_AA_1_1_58","0609_AA_1_1_66_1-10","0616_AA_1_1_67_11-20","0622_AA_1_1_67_18","0623_AA_1_1_67_19","0624_AA_1_1_68_21-60","0624_AA_1_1_68_21","0625_AA_1_1_68_22","0626_AA_1_1_68_23","0627_AA_1_1_68_24","0628_AA_1_1_68_25","0629_AA_1_1_68_26","0630_AA_1_1_68_27","0640_AA_1_1_68_37_SL","0642_AA_1_1_68_39","0643_AA_1_1_68_40","0644_AA_1_1_68_41","0645_AA_1_1_68_42","0646_AA_1_1_68_43","0647_AA_1_1_68_44","0648_AA_1_1_68_45","0649_AA_1_1_68_46","0650_AA_1_1_68_47","0651_AA_1_1_68_48","0652_AA_1_1_68_49","0653_AA_1_1_68_50","0654_AA_1_1_68_51","0655_AA_1_1_68_52","0656_AA_1_1_68_53","0657_AA_1_1_68_54","0658_AA_1_1_68_55","0659_AA_1_1_68_56","0660_AA_1_1_68_57","0661_AA_1_1_68_58","0661c_AA_1_1_68_58-2","0663_AA_1_1_68_60","0664_AA_1_1_68_21_60","0665_AA_1_1_68_21_61-80","0665_AA_1_1_68_21_61","0671_AA_1_1_69_67","0672_AA_1_1_69_68","0673_AA_1_1_69_69","0674_AA_1_1_69_70","0675_AA_1_1_69_71","0676_AA_1_1_69_72","0677_AA_1_1_69_73","0678_AA_1_1_69_74","0679_AA_1_1_69_75","0680_AA_1_1_69_76","0685-0701_AA_1_1_70_81-100","0685_AA_1_1_69_81-100","0685_AA_1_1_69_81","0686_AA_1_1_69_82","0687_AA_1_1_69_83","0688_AA_1_1_69_85","0689_AA_1_1_69_86","0690_AA_1_1_69_87","0691_AA_1_1_70_89-1","0691_AA_1_1_70_89","0692_AA_1_1_70_89-2","0692_AA_1_1_70_89","0693_AA_1_1_70_90","0694_AA_1_1_70_92","0695_AA_1_1_70_93-1","0695_AA_1_1_70_93","0696_AA_1_1_70_93-2","0696_AA_1_1_70_93","0696_AA_1_1_70_94","0697_AA_1_1_70_94","0697_AA_1_1_70_95","0698_AA_1_1_70_95","0698_AA_1_1_70_96","0699_AA_1_1_70_96","0699_AA_1_1_70_97","0700_AA_1_1_70_97","0700_AA_1_1_70_98","0701_AA_1_1_70_99","0702_AA_1_1_71","0703_AA_1_1_72","0704_AA_1_1_73","0705_AA_1_1_74","0706_AA_1_1_74_","0706_AA_1_2_75","0707_AA_1_2_76","0708_AA_1_2_77","0709_AA_1_2_78","0710_AA_1_2_79","0711_AA_1_2_79","0711_AA_1_2_80","0712_AA_1_2_80","0712_AA_1_2_81","0713_AA_1_2_81","0713_AA_1_2_82","0714_AA_1_2_82","0714_AA_1_2_83","0715_AA_1_2_83","0715_AA_1_2_84","0716_AA_1_2_84","0716_AA_1_2_85","0717_AA_1_2_85","0717_AA_1_2_86","0718_AA_1_2_86","0718_AA_1_2_87","0719_AA_1_2_87","0719_AA_1_2_88","0720_AA_1_2_88","0720_AA_1_2_89","0721_AA_1_2_90","0722_AA_1_2_91","0723_AA_1_2_92","0724_AA_1_2_93","0725_AA_1_2_94","0726_AA_1_2_95","0727_AA_1_2_96","0728_AA_1_2_97","0729_AA_1_2_98","0730_AA_1_2_99","0731_AA_1_2_99","0732_AA_1_2_100","0733_AA_1_2_101","0734_AA_1_2_102","0735_AA_1_2_103","0736_AA_1_2_104","0737_AA_1_2_105","0738_AA_1_2_106","0739_AA_1_2_107","0740_AA_1_2_108","0751_AA_1_2_119","0752_AA_1_2_120","0753_AA_1_2_121","0754_AA_1_2_122","0755_AA_1_2_123","0756_AA_1_2_124","0757_AA_1_2_125","0758_AA_1_2_126","0759_AA_1_2_127","0760_AA_1_2_128","0761_AA_1_2_129","0762_AA_1_2_130","0763_AA_1_2_131","0764_AA_1_2_132","0765_AA_1_2_133","0766_AA_1_2_134","0767_AA_1_2_135","0768_AA_2_1_136","0769_AA_2_1_137","0770_AA_2_1_138","0800_AA_2_1_168","0801_AA_2_1_169","0802_AA_2_1_170","0803_AA_2_1_171","0804_AA_2_1_172","0805_AA_2_1_173","0806_AA_2_1_174","0807_AA_2_1_175","0808_AA_2_1_176","0809_LTWA_1","0810_LTWA_2","0811_LTWA_3","0812_LTWA_4","0813_LTWA_5","0814_LTWA_6","0815_LTWA_7","0816_LTWA_8","0817_LTWA_9","0818_LTWA_10","0819_LTWA_11","0820_LTWA_12","0821_LTWA_13","0822_LTWA_14","0823_LTWA_15","0824_LTWA_16","0826_LTWA_18","0834_LTWA_26","0838_LTWA_30","0840_LTWA_32","0843_LTWA_35","0848_LTWA_38ka","0849_LTWA_38kh","0850_LTWA_39_1","0858_LTWA_40kh","0866_LTWA_45","0869_LTWA_48","0872_LTWA_51","0886_LTWA_63.JPG","0886_LTWA_63","0915_LTWA_90ka","0916_LTWA_90kh","0923_LTWA_97ka","0924_LTWA_97kha","0925_LTWA_97ga","0942_LTWA_154","0963_LTWA_175","1031_LTWA_242","1032_LTWA_243","1033_LTWA_244","1034_LTWA_245","1035_LTWA_246","1036_LTWA_247","1037_LTWA_248","1038_LTWA_249","1039_LTWA_250","1063_LTWA_274","1066_LTWA_277","1067_LTWA_278","1084_LTWA_295","1123_LTWA_334","1259_LTWA_501","1260_LTWA_502","1261_LTWA_503","1262_LTWA_504","1263_LTWA_505","1264_LTWA_506","1265_LTWA_507","1266_LTWA_508","1267_LTWA_509","1268_LTWA_510","1269_LTWA_511","1270_LTWA_512","1271_LTWA_513","1272_LTWA_514","1273_LTWA_515","1274_LTWA_516","1275_LTWA_517","1276_LTWA_518","1277_LTWA_519","1278_LTWA_520","1279_LTWA_521","1280_LTWA_522","1281_LTWA_523","1282_LTWA_524","1283_LTWA_525","1284_LTWA_526","1285_LTWA_527","1286_LTWA_528","1287_LTWA_529","1288_LTWA_530","1289_LTWA_531","1290_LTWA_532","1291_LTWA_533","1292_LTWA_534","1293_LTWA_535","1294_LTWA_536","1295_LTWA_537","1296_LTWA_538","1297_LTWA_539","1298_LTWA_540","1299_LTWA_541","1300_LTWA_542","1301_LTWA_543","1302_LTWA_544","1303_LTWA_545","1304_LTWA_546","1305_LTWA_547","1306_LTWA_548","1307_LTWA_549","1308_LTWA_550","1309_LTWA_551","1310_LTWA_552","1311_LTWA_553","1312_LTWA_554","1313_LTWA_555","1314_LTWA_556","1315_LTWA_557","1316_LTWA_558","1317_LTWA_559","1318_LTWA_560","1319_LTWA_561","1320_LTWA_562","1321_LTWA_563","1322_LTWA_564","1323_LTWA_565","1324_LTWA_566","1325_LTWA_567","1326_LTWA_568","1327_LTWA_569","1328_LTWA_570","1329_LTWA_571","1330_LTWA_572","1331_LTWA_573","1332_LTWA_574","1333_LTWA_575","1334_LTWA_576","1335_LTWA_577","1336_LTWA_578","1337_LTWA_579","1338_LTWA_580","1339_LTWA_581","1340_LTWA_582","1341_LTWA_583","1342_LTWA_584","1343_LTWA_585","1344_LTWA_586","1344_LTWA_586x","1345_LTWA_587","1346_LTWA_588","1347_LTWA_589","1348_LTWA_590","1349_LTWA_591","1350_LTWA_592","1351_LTWA_593","1352_LTWA_594","1353_LTWA_595","1354_LTWA_596","1355_LTWA_597","1356_LTWA_598","1357_LTWA_599","1358_LTWA_600","1359_LTWA_601","1360_LTWA_602","1361_LTWA_603","1362_LTWA_604","1363_LTWA_605","1364_LTWA_606","1365_LTWA_607","1366_LTWA_608","1367_LTWA_609","1368_LTWA_610","1369_LTWA_611","1370_LTWA_612","1371_LTWA_613","1372_LTWA_614","1373_LTWA_615","1374_LTWA_616","1375_LTWA_617","1376_LTWA_618","1377_LTWA_619","1378_LTWA_620","1379_LTWA_621","1380_LTWA_622","1381_LTWA_623","1382_LTWA_624","1383_LTWA_625","1384_LTWA_626","1385_LTWA_627","1386_LTWA_628","1387_LTWA_629","1388_LTWA_630","1389_LTWA_631","1390_LTWA_632","1391_LTWA_633","1392_LTWA_634","1393_LTWA_635","1394_LTWA_636","1395_LTWA_637","1396_LTWA_638","1397_LTWA_639","1398_LTWA_640","1399_LTWA_641","1400_LTWA_642","1401_LTWA_643","1402_LTWA_644","1403_LTWA_645","1404_LTWA_646","1405_LTWA_647","1406_LTWA_648","1407_LTWA_649","1408_LTWA_650","1409_LTWA_651","1410_LTWA_652","1411_LTWA_653","1412_LTWA_654","1413_LTWA_655","1414_LTWA_656","1415_LTWA_657","1416_LTWA_658","1417_LTWA_659","1418_LTWA_660","1419_LTWA_661","1420_LTWA_662","1420_LTWA_662L","1421_LTWA_663","1422_LTWA_664","1423_LTWA_665","1424_LTWA_666","1425_LTWA_667","1426_LTWA_668","1427_LTWA_669","1428_LTWA_670","1429_LTWA_671","1430_LTWA_672","1431_LTWA_673","1432_LTWA_674","1433_LTWA_675","1434_LTWA_676","1435_LTWA_677","1436_LTWA_678","1437_LTWA_679","1438_LTWA_680","1439_LTWA_681","1440_LTWA_682","1441_LTWA_683","1442_LTWA_684","1443_LTWA_685","1444_LTWA_686","1445_LTWA_687","1446_LTWA_688","1447_LTWA_689","1448_LTWA_690","1449_LTWA_691","1450_LTWA_692","1451_LTWA_693","1452_LTWA_694","1453_LTWA_695","1454_LTWA_696","1455_LTWA_697","1456_LTWA_698","1457_LTWA_699","1458_LTWA_700","1459_LTWA_701","1460_LTWA_702","1461_LTWA_703","1462_LTWA_704","1463_LTWA_705","1464_LTWA_706","1465_LTWA_707","1466_LTWA_708","1467_LTWA_709","1468_LTWA_710","1469_LTWA_711","1470_LTWA_712","1471_LTWA_713","1472_LTWA_714","1473_LTWA_715","1474_LTWA_716","1475_LTWA_717","1476_LTWA_718","1477_LTWA_719","1478_LTWA_720","1479_LTWA_721","1480_LTWA_722","1481_LTWA_723","1482_LTWA_724","1483_LTWA_725","1484_LTWA_726","1485_LTWA_727","1486_LTWA_728","1487_LTWA_729","1488_LTWA_730","1489_LTWA_731","1490_LTWA_732","1491_LTWA_733","1492_LTWA_734","1493_LTWA_735","1494_LTWA_736","1495_LTWA_737","1496_LTWA_738","1497_LTWA_739","1498_LTWA_740","1499_LTWA_741","1500_LTWA_742","1501_LTWA_743","1502_LTWA_744","1503_LTWA_745","1504_LTWA_746","1505_LTWA_747","1506_LTWA_748","1507_LTWA_749","1508_LTWA_750","1509_LTWA_751","1510_LTWA_752","1511_LTWA_753","1512_LTWA_754","1513_LTWA_755","1514_LTWA_756","1515_LTWA_757","1516_LTWA_758","1517_LTWA_759","1518_LTWA_760","1519_LTWA_761","1520_LTWA_762","1521_LTWA_763","1522_LTWA_764","1523_LTWA_765","1524_LTWA_766","1525_LTWA_767","1526_LTWA_768","1527_LTWA_769","1528_LTWA_770","1529_LTWA_771","1530_LTWA_772","1531_LTWA_773","1532_LTWA_774","1533_LTWA_775","1534_LTWA_776","1535_LTWA_777","1536_LTWA_778","1537_LTWA_779","1538_LTWA_780","1539_LTWA_781","1540_LTWA_782","1541_LTWA_783","1542_LTWA_784","1543_LTWA_785","1544_LTWA_786","1545_LTWA_787","1546_LTWA_788","1547_LTWA_789","1548_LTWA_790","1549_LTWA_791","1550_LTWA_792","1551_LTWA_793","1552_LTWA_794","1553_LTWA_795","1554_LTWA_796","1555_LTWA_797","1556_LTWA_798","1557_LTWA_799","1558_LTWA_800","1559_LTWA_800","1560_LTWA_801","1561_LTWA_802","1562_LTWA_803","1563_LTWA_804","1564_LTWA_805","1565_LTWA_806","1566_LTWA_807","1567_LTWA_808","1568_LTWA_809","1569_LTWA_810","1570_LTWA_811","1571_LTWA_812","1572_LTWA_813","1573_LTWA_814","1574_LTWA_815","1575_LTWA_816","1576_LTWA_817","1577_LTWA_818","1578_LTWA_819","1579_LTWA_820","1580_LTWA_821","1581_LTWA_822","1582_LTWA_823","1583_LTWA_824","1584_LTWA_825","1585_LTWA_826","1586_LTWA_827","1587_LTWA_828","1588_LTWA_829","1589_LTWA_830","1590_LTWA_831","1591_LTWA_832","1592_LTWA_833","1593_LTWA_834","1594_LTWA_835","1595_LTWA_836","1596_LTWA_837","1597_LTWA_838","1598_LTWA_839","1599_LTWA_840","1600_LTWA_841","1601_LTWA_842","1602_LTWA_843","1603_LTWA_844","1604_LTWA_845","1605_LTWA_846","1606_LTWA_847","1607_LTWA_848","1608_LTWA_849","1609_LTWA_850","1610_LTWA_851","1611_LTWA_852","1612_LTWA_853","1613_LTWA_854","1614_LTWA_855","1615_LTWA_856","1616_LTWA_857","1617_LTWA_858","1618_LTWA_859","1619_LTWA_860","1620_LTWA_861","1621_LTWA_862","1622_LTWA_863","1623_LTWA_864","1624_LTWA_865","1625_LTWA_866","1626_LTWA_867","1627_LTWA_868","1628_LTWA_869","1629_LTWA_870","1630_LTWA_871","1631_LTWA_872","1632_LTWA_873","1633_LTWA_874","1634_LTWA_875","1635_LTWA_876","1636_LTWA_877","1637_LTWA_878","1638_LTWA_879","1639_LTWA_880","1640_LTWA_881","1641_LTWA_882","1642_LTWA_883","1643_LTWA_884","1644_LTWA_885","1645_LTWA_886","1646_LTWA_887","1647_LTWA_888","1648_LTWA_889","1649_WB_1","1650_WB_2","1651_WB_3","1652_WB_4","1653_WB_5","1654_WB_6","1655_WB_7","1656_WB_8","1657_WB_9","1658_WB_10","1659_WB_11","1660_WB_12","1661_WB_13","1662_WB_14","1663_WB_15","1664_WB_16","1665_WB_17","1666_WB_18","1667_WB_19","1668_WB_20","1669_WB_21","1670_WB_22","1671_DHC_1","1672_LTWA_890","1673_LTWA_891","328_SBB6177_S"];
			var pdf2 = document.getElementsByClassName("hKCCGE")[0].title.split("ID")[1].split("(")[1].replace(")","");
			e.stopImmediatePropagation()
			e.preventDefault()
			$(target).attr('href', pdf2+".pdf")
			if (numbersArray2.includes(pdf2)) {
				alert("No PDF File");
			} else {	
				window.open("https://crossasia.org/resources/apps/iiif-viewer/manifests/pdf/"+pdf2+".pdf", '_blank')
			}
		}
    }
	});
	
$(window).on('load', function() {
    setTimeout(function() {
        $.ajax({
            url: "https://crossasia.org/",
            data: {
                type: '1001'
            },
            xhrFields: {
                withCredentials: true
            },
            success: function(data) {
                if (data && data.trim().length > 0) {
                    $("#xa-header").html(data);
                    console.log("Header loaded successfully.");
                } else {
                    console.error("Empty or invalid response from server.");
                }
            },
            error: function(xhr, status, error) {
                console.error("AJAX request failed:", status, error);
            }
        });
    }, 1000); // Delay the header load by 500ms
});

// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", function () {
    // Function to update the placeholder
    function updatePlaceholder() {
        const inputElement = document.querySelector('input.flex-1.pl-5.outline-none[name="fulltext"][placeholder="Search"]');
        if (inputElement && inputElement.placeholder !== "Enter search term or click ‘Search’ to browse") {
            inputElement.placeholder = "Enter search term or click ‘Search’ to browse";
        }
    }

    // Run the function immediately
    updatePlaceholder();

    // Set up an interval to check and update the placeholder every 500ms
    setInterval(updatePlaceholder, 500);
});

document.documentElement.setAttribute('data-path', window.location.pathname);

// Fallback: Force-hide if CSS fails (MutationObserver for dynamic content)
const hideLogo = () => {
    const logo = document.getElementById('LogoDFG');
    if (!logo) return;
    
    const path = window.location.pathname;
    const hidePaths = ['/s/dtab', '/s/dllm', '/s/lanna', '/s/kashgar_documents'];
    
    if (hidePaths.some(p => path.includes(p)) && !path.includes('/s/turfan')) {
        logo.style.display = 'none';
        logo.style.setProperty('display', 'none', 'important');
    }
};

// Run immediately and observe DOM changes
hideLogo();
new MutationObserver(hideLogo).observe(document.body, { subtree: true, childList: true });