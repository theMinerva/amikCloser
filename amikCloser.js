function talkTemplate(header,amikText,amikYear,amikWeek_,msgBox, currentBox, progressBar){
		var api = new mw.Api();
			api.get( {action: 'parse',prop: 'wikitext', format: 'json', page: "بحث:"+header, section:0} ).done( function ( data ) {
				//if there is a talk page
			var wikitext = getWiki(data,msgBox,header)+"{{تاریخچه مقاله| dykdate = "+amikYear.value+"0100+"+amikWeek_+"weeks| dykentry = "+amikText+"| dyklink = ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/"+header+"}}";
			api.postWithEditToken({action: 'edit', title: "کاربر:Nightdevil/ر",text: wikitext,minor: true, summary: "test"
				}).done(function(result) {
				msgBox.setLabel("الگوی تاریخچه با موفقیت به بحث مقاله افزوده شد. در حال افزودن الگوی {{بسته}} آمیک به این گفتگو.")
				closeSuccess(header, msgBox, currentBox, amikYear, amikWeek_, progressBar);
				}).fail(function(){msgBox.setLabel("خطا در ذخیره کردن الگوی هفته. عملیات متوقف شد.")})
		
			}).fail(function(){
			//if there is no talk page
			var wikitext = "{{رتب}}{{بصب}}{{تاریخچه مقاله| dykdate = "+amikYear.value+"0100+"+amikWeek_+"weeks| dykentry = "+amikText+"| dyklink = ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/"+header+"}}";
			api.postWithEditToken({action: 'edit', title: "کاربر:Nightdevil/ر",text: wikitext,minor: true, summary: "test"
				}).done(function(result) {
				msgBox.setLabel("صفجه بحث مقاله ساخته شد و الگوی تاریخچه با موفقیت به آن افزوده شد. در حال افزودن الگوی {{بسته}} آمیک به این گفتگو.")
				closeSuccess(header, msgBox, currentBox, amikYear, amikWeek_, progressBar);
				}).fail(function(error){msgBox.setLabel("خطا در ذخیره کردن الگوی هفته. عملیات متوقف شد.")})
			})
}

function closeSuccess(header, msgBox, currentBox, amikYear, amikWeek_, progressBar){
	var api = new mw.Api();
	api.get({action: 'parse',prop: 'wikitext', format: 'json', page:"ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/"+header}).done(function(data){
		var wikitext=getWiki(data,msgBox,header).replace(/(\=\=.+?=\=)/s, "$1\n{{بسته}}").replace("| هفته =","| هفته ="+amikWeek_).replace("| سال =","| سال ="+amikYear.value)+"{{پایان بسته}}";
		api.postWithEditToken({action: 'edit', title: "کاربر:Nightdevil/ر", text: wikitext, minor: true, summary: "test"}).done(function() {
			msgBox.setLabel("وظیفه با موفقیت انجام شد.");
			msgBox.setIcon("check");
			msgBox.setType("success");
			progressBar.$element.remove();
			currentBox.innerHTML += '<p>آمیک <b>'+header+'</b> به <a href="https://fa.wikipedia.org/wiki/ویکی‌پدیا:آیا می‌دانستید که...؟/'+amikYear.value+'/هفته '+amikWeek_+'">الگوی هفتهٔ '+amikWeek_+'</a> از سال '+amikYear.value+' افزوده شد.</p><p>تاریخچهٔ آمیک در <a href="https://fa.wikipedia.org/wiki/بحث:'+header+'">صفحهٔ بحث مقالهٔ '+header+'</a> ثبت شد.</p><p>صفحهٔ <a href="https://fa.wikipedia.org/wiki/ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/'+header+'">گفتگوی پیش&zwnj;نویس آمیک</a> بسته شد.</p>';
		}).fail(function() {msgBox.setLabel("خطا در دخیره الگوی جمع‌بندی بحث. عملیات ناموفق بود.");})
	}).fail(function(){msgBox.setLabel("خطا در ارتباط با سرور");})
}

	function getWiki(data,msgBox,header) {
				try{
					let pages = data.parse.wikitext;
					let firstKey = Object.keys(pages);
					return pages[firstKey];
				}
				catch(e){
					msgBox.setLabel("خطا در خواندن [[ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/"+header+"]]. ممکن است عنوان آمیک پیشنهادی در صفحه پیش‌نویس اشتباه وارد شده باشد و باید دستی جمع‌بندی شود.")
				}
			}

	function postEdit(wikitext, editSummary, pageName, secIdx) {
				var api = new mw.Api();
				api.postWithEditToken({
					action: 'edit',
					title: pageName,
					text: wikitext,
					section: secIdx,
					minor: true,
					summary: editSummary
				}).done(function(result) {
					window.location = "/w/index.php?title=" + pageName + "&type=revision&diff=cur&oldid=prev";
				});
			}

	function execute(currentRow, header, jamReason){
				mw.util.addCSS('.oo-ui-window-frame { width: 700px!important; }');
				OO.ui.confirm("آیا از جمع‌بندی ناموفق این پیشنهاد ("+header+") اطمینان دارید؟ \n دلیل: "+ jamReason.value).done(function(confirmed) {
					if ( confirmed ) {
			//			console.log( "https://fa.wikipedia.org/w/api.php?action=parse&page={{ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/"+header+"}}&prop=wikitext&format=json"			);
						var msgBox = new OO.ui.MessageWidget( {
							icon: 'pageSettings',
							type: 'notice',
							label: 'در حال پردازش درخواست — آغاز درخواست ویرایش، در حال دریافت اطلاعات بخش به‌منظور ویرایش.'
						});
						var progressBar = new OO.ui.ProgressBarWidget( {
							progress: false	
						});
						var currentBox = currentRow.parentElement.parentElement
						currentBox.innerHTML = "";
						$(currentBox).append(progressBar.$element);
						$(currentBox).append(msgBox.$element);
						$.ajax({
								url: "https://fa.wikipedia.org/w/api.php?action=parse&page=ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/"+header+"&prop=wikitext&format=json",
								success: function(data) {
									var wikitext=getWiki(data,msgBox,header).replace(/(\=\=.+?=\=)/s, "$1\n{{بسته|ناموفق=بله}}\n"+jamReason.value+"  SIGNATURE")+"{{پایان بسته}}"
									//console.log(q2)
									var editSummary = "test:"+jamReason.value
									var pageName ="کاربر:Nightdevil/صفحه تمرین"
									var secIndx;
									msgBox.setLabel('در حال پردازش درخواست — در حال ارسال اطلاعات به سرور')
									postEdit(wikitext, editSummary, pageName, secIndx);
								},
								error: function(xhr, error) {
									msgBox.setLabel('خطا در ارتباط با سرور')
									console.log(xhr);
									console.log(error);
								}
						});	
						
					} else {
						console.log( 'User clicked "Cancel" or closed the dialog.' );
							}
					
				})
				
				
			}

	function addButtons(currentRow, header) {
			//	var header = currentRow.parentElement.parentElement.parentElement.parentElement.children[0].children[1].id
			//	console.log(header)
			var currentBox = currentRow.parentElement.parentElement
				//دکمه جمع‌بندی
				var jamBandiB = new OO.ui.ButtonWidget( {
					icon: "expand",
					label: "جمع‌بندی بحث آمیک",
					title: "جمع‌بندی بحث آمیک",
					flags: ['progressive']
				});
				jamBandiB.on("click", function() {
					if (jamBandiB.getIcon() == "expand") {
						currentRow.children[2].style = "";
						jamBandiB.setIcon("collapse");
						jamBandiB.setLabel("بستن نوار جمع‌بندی");
					} else {
						currentRow.children[2].style = "display:none";
						inputText = "";
						jamBandiB.setIcon("expand");
						jamBandiB.setLabel("جمع‌بندی بحث آمیک");
					}
				});
				$(currentRow)[0].textContent ="";
				$(currentRow).append(jamBandiB.$element)
				
				//نوار قالبش
				$(currentRow).append('<tr><td colspan="2"><div style="display: flex; justify-content: center;"></div></td></tr><tr style="display:none;"><td colspan=2 style="padding-bottom:10px; text-align:center"><div style="display: flex; justify-content: center;"></div></td></tr>');

				//دراپ‌داون انتخاب سال
				var amikYear = new OO.ui.DropdownInputWidget( {
					options: [
						{data: "۲۰۲۲", label: "سال ۲۰۲۲"},
						{data:"۲۰۲۳", label: "سال ۲۰۲۳"},
						{data:"۲۰۲۴", label: "سال ۲۰۲۴"}
					],indicator: 'required', align:'right'
				});
				
				//ورود هفته
				var currentTime = new Date()
				function week(year,month,day) {
					function serial(days) { return 86400000*days; }
					function dateserial(year,month,day) { return (new Date(year,month-1,day).valueOf()); }
					function weekday(date) { return (new Date(date)).getDay()+1; }
					function yearserial(date) { return (new Date(date)).getFullYear(); }
					var date = year instanceof Date ? year.valueOf() : typeof year === "string" ? new Date(year).valueOf() : dateserial(year,month,day), 
						date2 = dateserial(yearserial(date - serial(weekday(date-serial(1))) + serial(4)),1,3);
					return ~~((date - date2 + serial(weekday(date2) + 5))/ serial(7));
				}
				week(currentTime.getFullYear(), currentTime.getMonth() + 1, currentTime.getDate())
				var amikWeek = new OO.ui.NumberInputWidget({
					align: 'left',
					input: { value: week(currentTime.getFullYear(), currentTime.getMonth() + 1, currentTime.getDate())+1 },
					min: 1,max: 53});
				amikWeek.$input[0].style = "text-align:center; display: block; margin:auto";
				amikWeek.$input[0].parentElement.style = "font-size:113.63%";

				//دکمه اعمال
				var doneB = new OO.ui.ButtonWidget( {
					icon: "checkAll",
					label: "اعمال جمع‌بندی موفق",
					flags: ["primary", "progressive"],
					title: "اعمال جمع‌بندی موفق"
				});
				doneB.on("click", function() {
				OO.ui.confirm("آیا از جمع‌بندی موفقانهٔ این پیشنهاد ("+header+") اطمینان دارید؟").done(function(confirmed) {
				if ( confirmed ) {
					//msg box
					var msgBox = new OO.ui.MessageWidget( {
						icon: 'pageSettings',
						type: 'notice',
						label: 'در حال پردازش درخواست — آغاز درخواست ویرایش، در حال دریافت اطلاعات بخش به‌منظور ویرایش.'
					});
					var progressBar = new OO.ui.ProgressBarWidget( {
						progress: false	
					});
					currentBox.innerHTML = "";
					$(currentBox).append(progressBar.$element);
					$(currentBox).append(msgBox.$element);
					//
					var amikWeek_ = amikWeek.value.replace(/1/g,"۱").replace(/2/g,"۲").replace(/3/g,"۳").replace(/4/g,"۴").replace(/5/g,"۵").replace(/6/g,"۶").replace(/7/g,"۷").replace(/8/g,"۸").replace(/9/g,"۹").replace(/0/g,"۰")
					var amikWeekURL = "ویکی‌پدیا:آیا می‌دانستید که...؟/"+amikYear.value+"/هفته "+amikWeek_
					//get amikText
					var api = new mw.Api();
						api.get( {action: 'parse',prop: 'wikitext', format: 'json', page: "ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/"+header} ).done( function ( data ) {
							var amikText = getWiki(data,msgBox,header).match(/\{\{گفتاورد\|(.*?)؟/)[0].substring(10)
							// if weekly template exists	
							api.get( {action: 'parse',prop: 'wikitext', format: 'json', page: amikWeekURL} ).done( function ( data ) {
								msgBox.setLabel('الگوی هفته مورد نظر دریافت شد. در حال افزودن آمیک ...');
								if(getWiki(data,msgBox,header).includes("… <!-- متن آمیک -->؟")){
									// see if there is a place
									var wikitext = getWiki(data,msgBox,header).replace("… <!-- متن آمیک -->؟",amikText)
									var editSummary = "test"
									var pageName ="کاربر:Nightdevil/گز"
									api.postWithEditToken({action: 'edit', title: pageName,text: wikitext,minor: true, summary: editSummary
										}).done(function(result) {
										msgBox.setLabel("الگوی هفته با موفقیت ذخیره شد. در حال افزودن الگوی {{تاریخچه مقاله}} آمیک به بحث مقاله.")
										talkTemplate(header,amikText,amikYear,amikWeek_,msgBox, currentBox, progressBar)
										}).fail(function(){msgBox.setLabel("خطا در ذخیره کردن الگوی هفته. عملیات متوقف شد.")})
								}else{
									msgBox.setLabel("الگوی هفتهٔ انتخاب‌شده ("+amikWeekURL+") جای خالی ندارد. هفته‌ای دیگر را انتخاب کنید.");
									msgBox.setType("error");
									msgBox.setIcon("alert");
									var jjjjj = new OO.ui.ButtonWidget( {
										icon: "back",
										label: "بازگشت",
										flags: ['destructive']
									});
									jjjjj.on("click", function() {
									msgBox.$element.remove();
									progressBar.$element.remove();
									$(currentBox).append(hzLayoutT.$element)
									msgBox.$element.remove();
									progressBar.$element.remove();
									jjjjj.$element.remove();
									});
									$(currentBox).append(jjjjj.$element)				
								}
							//	console.log(getWiki(data,msgBox,header))
							}).fail(function(error){
							//create weekly page
								msgBox.setLabel('الگوی هفته مورد نظر هنوز ساخته نشده است. در حال ساخت صفحه ...');
								api.get( {action: 'parse',prop: 'wikitext', format: 'json', page:"ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌بارگذاری الگوی هفتگی"} ).done( function ( data ) {
								var wikitext = getWiki(data,msgBox,header).replace("… <!-- متن آمیک -->؟",amikText)
								api.postWithEditToken({action: 'edit', title: "کاربر:Nightdevil/پ",text: wikitext,minor: true, summary: "test"
										}).done(function(result) {
										msgBox.setLabel("الگوی هفته با موفقیت ایجاد شد. در حال افزودن الگوی {{تاریخچه مقاله}} آمیک به بحث مقاله.")
										talkTemplate(header,amikText,amikYear,amikWeek_,msgBox, currentBox, progressBar)
										}).fail(function(){msgBox.setLabel("خطا در ذخیره کردن الگوی هفته. عملیات متوقف شد.")})
								})
								});
						}).fail(function(error){
							msgBox.setLabel("خطا در خواندن [[ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/"+header+"]]. ممکن است عنوان آمیک پیشنهادی در صفحه پیش‌نویس اشتباه وارد شده باشد و باید دستی جمع‌بندی شود.")
							console.log("failed")});
					}
						
				});
				})
				//دراپ‌داون انتخاب سال
				var jamReason = new OO.ui.DropdownInputWidget( {
					options: [
						{data: "جمع‌بندی نرم"},
						{data:"مقاله کمتر از ۲۰۰ کلمه"},
						{data:"بدون منبع معتبر"},
						{data:"عدم جذابیت"},
						{data:"نقض معیارهای عمومی آمیک"},
						{data:"مخالفت اجماع کاربران"}
					],indicator: 'required', label: 'دلیل جمع‌بندی ناموفق', labelPosition: 'before', align: 'center'
				});
				//دکمه جمع‌بندی ناموفق
				var jamBandiNo = new OO.ui.ButtonWidget( {
					icon: "clear",
					label: "جمع‌بندی ناموفق آمیک",
					title: "جمع‌بندی ناموفق آمیک",
					flags: ["primary", "destructive"],
				});
				jamBandiNo.on("click", function() {
					execute(currentRow, header, jamReason);
				});

				//ایجاد نوار 
				var hzLayoutT = new OO.ui.FieldsetLayout( {label: '',helpInline: true,
					help:"دلیل جمع‌بندی غیر موفق"
					} );
				var topLayout = new OO.ui.FieldsetLayout( {helpInline: true,
					help:"مشخص کنید که آمیک در چه هفته از چه سالی در صفحهٔ اصلی نمایش یابد. الان در هفتهٔ "+toFa(week(currentTime.getFullYear(), currentTime.getMonth() + 1, currentTime.getDate()))+"م از سال "+toFa(currentTime.getFullYear())+" هستیم"
				});
				amikYear.$element.style = "width:50%";
				topLayout.addItems([amikYear, amikWeek, doneB]);
				hzLayoutT.addItems([jamReason, jamBandiNo]);
				$(currentRow.children[2]).append(topLayout.$element);
				$(currentRow.children[2]).append(hzLayoutT.$element);
				topLayout.$element.style = "text-align:center; display: block; margin:auto";
				
				
			}

function toFa(foo){
	return foo.toString().replace(/1/g,"۱").replace(/2/g,"۲").replace(/3/g,"۳").replace(/4/g,"۴").replace(/5/g,"۵").replace(/6/g,"۶").replace(/7/g,"۷").replace(/8/g,"۸").replace(/9/g,"۹").replace(/0/g,"۰")
	
}

	if(document.title.slice(0,27) == 'ویکی‌پدیا:آیا می‌دانستید که' || document.title.slice(0,27) == 'کاربر:Nightdevil/صفحه تمرین'){
			var amikBoxes = document.getElementsByClassName("infobox")
			if (amikBoxes.length != 0) {
				mw.loader.using(["oojs-ui-core", "oojs-ui-widgets", "oojs-ui-windows"]).done(function() {
					mw.loader.load(["oojs-ui.styles.icons-alerts", "oojs-ui.styles.icons-interactions", "oojs-ui.styles.icons-moderation", "oojs-ui.styles.icons-user", "oojs-ui.styles.icons-content", "oojs-ui.styles.icons-editing-core", "oojs-ui.styles.icons-editing-advanced"]);
						for (var i = 0; i < amikBoxes.length; i++) {
							var currentBox = amikBoxes[i].children[0]; //تعریف فضای فعلی
							var header = amikBoxes[i].getElementsByClassName("infobox-header")[0].textContent.replace('بررسی آمیک ','');	//گرفتن عنوان
							//var header = amikBoxes[i].previousElementSibling.previousElementSibling.previousElementSibling.children[1].id;
							//console.log(header)
							var currentRow = currentBox.children[6].children[0];	//تعریف نوار
							if (amikBoxes[i].parentElement.children[0].tagName == "SMALL") {//چک کردن اینکه قبلا بسته شده است
							//	addButtons(currentBox);		// 
							} else if (amikBoxes[i].children[0].children[0].children[0].textContent.slice(6,10) == "آمیک") { 
								addButtons(currentRow,header);		//افزودن دکمه جمع‌بندی
							
						}
					}
				})
			}
		}else{
	//		console.log("not dyk")
			}