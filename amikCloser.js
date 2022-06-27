//v#1.1.0
var archsTemp; //don't remove
var archsSofts; //don't remove
function getWikitextPreview(amikText, previewField) {
	var api = new mw.Api();
	api.get({
		action: "parse",
		format: "json",
		text: amikText,
		prop: "text",
		contentmodel: "wikitext"
	}).done(function(data) {
		previewField.setLabel(new OO.ui.HtmlSnippet("" + data.parse.text["*"] + ""));
	}).fail(function(data) {
		console.log("failed");
	});
}

function editFinalText(amikText, amikWeekURL, msgBox, header, amikYear, amikWeek_, currentBox, progressBar, amikTextOp, topLayout, amikImage) {
	var newAmikText;
	function MyProcessDialog(config) {
		MyProcessDialog.super.call(this, config);
	}
	OO.inheritClass(MyProcessDialog, OO.ui.ProcessDialog);
	MyProcessDialog.static.name = "myProcessDialog";
	MyProcessDialog.static.title = "اصلاح متن آمیک";
	MyProcessDialog.static.actions = [{
		action: "save",
		label: "ذخیره",
		flags: ["primary", "progressive"]
	}];
	MyProcessDialog.prototype.initialize = function() {
		MyProcessDialog.super.prototype.initialize.apply(this, arguments);
		this.content = new OO.ui.PanelLayout({
			padded: true,
			expanded: false
		});
		newAmikText = new OO.ui.MultilineTextInputWidget({
			rows: 4,
			value: amikText
		});
		this.previewNewText = new OO.ui.ButtonWidget({
			label: "پیش‌نمایش"
		});
		var previewField = new OO.ui.LabelWidget({
			label: new OO.ui.HtmlSnippet("در حال دریافت پیش‌نمایش")
		});
		previewField.$element[0].style = "margin:10px; border:dotted;margin-top:3px; padding:5px; ";
		this.previewNewText.on("click", function() {
			previewField.setLabel('در حال دریافت پیش‌نمایش');
			getWikitextPreview(newAmikText.value, previewField);
		});
		var warn01 = "<div style='margin-right:20px'>«…» در ابتدای آمیک و «؟» در انتهای آن فراموش نشود!</div>";
		var imagePreview = new OO.ui.LabelWidget();
		var amikTextOp_ = [];
		for(i = 0; i < amikTextOp.length; i++) {
			amikTextOp_.push(new OO.ui.MenuOptionWidget({
				data: amikTextOp[i].substring(10),
				label: amikTextOp[i].substring(10)
			}));
		}
		var proposedOptions = new OO.ui.ButtonMenuSelectWidget({
			icon: 'menu',
			label: 'گزینه‌های پیشنهادشده',
			menu: {
				items: amikTextOp_
			}
		});
		//proposedOptions.on("click", function(){newAmikText.setValue( "454" )})
		proposedOptions.getMenu().on('choose', function(menuOption) {
			newAmikText.setValue(menuOption.data);
		});
		this.content.$element.append(newAmikText.$element, this.previewNewText.$element, proposedOptions.$element);
		this.$body.append(this.content.$element, previewField.$element, warn01, imagePreview.$element);
		if(amikImage){
			getWikitextPreview("[[پرونده:"+amikImage+"|75px||بی‌قاب]]", imagePreview);
			var labelText= "<span style='margin-right: 10px; font-style: italic;'> &lt; تصویر آمیک: <small>"+amikImage+"</small></span>";
			this.$body.append(labelText)
		}else{imagePreview.setLabel(new OO.ui.HtmlSnippet("<div style='margin-right: 10px;margin-top: 30px; font-style: italic;'>برای آمیک «"+header+"» تصویری یافت نشد.</div>"));}
		
		getWikitextPreview(amikText, previewField);
	};
	MyProcessDialog.prototype.getBodyHeight = function() {
		return 400;
	};
	MyProcessDialog.prototype.getActionProcess = function(action) {
		var dialog = this;
		if(action) {
			return new OO.ui.Process(function() {
				amikText = newAmikText.value;
				console.log(amikText);
				processSucessClose(amikText, amikWeekURL, msgBox, header, amikYear, amikWeek_, currentBox, progressBar, topLayout, amikImage);
				dialog.close({
					action: action
				});
			});
		}
		return MyProcessDialog.super.prototype.getActionProcess.call(this, action);
	};
	var windowManager = new OO.ui.WindowManager();
	$(document.body).append(windowManager.$element);
	var dialog = new MyProcessDialog();
	windowManager.addWindows([dialog]);
	windowManager.openWindow(dialog);
}

function processSucessClose(amikText, amikWeekURL, msgBox, header, amikYear, amikWeek_, currentBox, progressBar, topLayout, amikImage) {
	if(amikImage){console.log(amikImage)}else{console.log("nO")}
	// if weekly template exists
	var api = new mw.Api();
	api.get({
		action: 'parse',
		prop: 'wikitext',
		format: 'json',
		page: amikWeekURL
	}).done(function(data) {
		
		
		
		msgBox.setLabel('الگوی هفته مورد نظر دریافت شد. در حال افزودن آمیک ...');
		if(getWiki(data, msgBox, header).includes("… <!-- متن آمیک -->؟")) {
			
			
			
			// see if there is a place
			var wikitext = getWiki(data, msgBox, header).replace("… <!-- متن آمیک -->؟", amikText);
			var editSummary = "افزودن آمیک [[ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/" + header + "]] به الگوی هفتگی ([[وپ:اجآ|ابزار جمع‌بندی آمیک]])";
			var pageName = amikWeekURL;
			api.postWithEditToken({
				action: 'edit',
				//title: pageName,
				title: 'کاربر:Nightdevil/ی',
				text: wikitext,
				minor: false,
				summary: editSummary
			}).done(function(result) {
				msgBox.setLabel("الگوی هفته با موفقیت ذخیره شد. در حال افزودن الگوی {{تاریخچه مقاله}} آمیک به بحث مقاله.");
				talkTemplate(header, amikText, amikYear, amikWeek_, msgBox, currentBox, progressBar);
			}).fail(function() {
				msgBox.setLabel("خطا در ذخیره کردن الگوی هفته. عملیات متوقف شد.");
			});
			
		} else {
			msgBox.setLabel("الگوی هفتهٔ انتخاب‌شده (" + amikWeekURL + ") جای خالی ندارد. هفته‌ای دیگر را انتخاب کنید.");
			msgBox.setType("error");
			msgBox.setIcon("alert");
			var jjjjj = new OO.ui.ButtonWidget({
				icon: "back",
				label: "بازگشت",
				flags: ['destructive']
			});
			jjjjj.on("click", function() {
				msgBox.$element.remove();
				progressBar.$element.remove();
				$(currentBox).append(topLayout.$element);
				msgBox.$element.remove();
				progressBar.$element.remove();
				jjjjj.$element.remove();
			});
			$(currentBox).append(jjjjj.$element);
		}
		//  console.log(getWiki(data,msgBox,header))
		
		
		
	}).fail(function(error) {
		//create weekly page
		msgBox.setLabel('الگوی هفته مورد نظر هنوز ساخته نشده است. در حال ساخت صفحه ...');
		api.get({
			action: 'parse',
			prop: 'wikitext',
			format: 'json',
			page: "ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌بارگذاری الگوی هفتگی"
		}).done(function(data) {
			var wikitext = getWiki(data, msgBox, header).replace("… <!-- متن آمیک -->؟", amikText);
			api.postWithEditToken({
				action: 'edit',
				//title: amikWeekURL,
				title: 'کاربر:Nightdevil/ب',
				text: wikitext,
				minor: false,
				summary: "افزودن آمیک [[ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/" + header + "]] به الگوی هفتگی ([[وپ:اجآ|ابزار جمع‌بندی آمیک]])"
			}).done(function(result) {
				msgBox.setLabel("الگوی هفته با موفقیت ایجاد شد. در حال افزودن الگوی {{تاریخچه مقاله}} آمیک به بحث مقاله.");
				talkTemplate(header, amikText, amikYear, amikWeek_, msgBox, currentBox, progressBar);
			}).fail(function() {
				msgBox.setLabel("خطا در ذخیره کردن الگوی هفته. عملیات متوقف شد.");
			});
		});
	});
}

function talkTemplate(header, amikText, amikYear, amikWeek_, msgBox, currentBox, progressBar) {
	var api = new mw.Api();
	api.get({
		action: 'parse',
		prop: 'wikitext',
		format: 'json',
		page: "بحث:" + header,
		section: 0
	}).done(function(data) {
		//if there is a talk page
		var wikitext = getWiki(data, msgBox, header) + "{{تاریخچه مقاله| dykdate = " + amikYear.value + "0100+" + amikWeek_ + "weeks| dykentry = " + amikText + "| dyklink = ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/" + header + "}}";
		api.postWithEditToken({
			action: 'edit',
			//title: "بحث:"+header,
			title: 'کاربر:Nightdevil/ر',
			text: wikitext,
			minor: false,
			summary: "افزودن الگوی تاریخچهٔ آمیک به بحث مقالهٔ [[" + header + "]] ([[وپ:اجآ|ابزار جمع‌بندی آمیک]])"
		}).done(function(result) {
			msgBox.setLabel("الگوی تاریخچه با موفقیت به بحث مقاله افزوده شد. در حال افزودن الگوی {{بسته}} آمیک به این گفتگو.");
			closeSuccess(header, msgBox, currentBox, amikYear, amikWeek_, progressBar);
		}).fail(function() {
			msgBox.setLabel("خطا در ذخیره کردن الگوی هفته. عملیات متوقف شد.");
		});
	}).fail(function() {
		//if there is no talk page
		var wikitext = "{{رتب}}{{بصب}}{{تاریخچه مقاله| dykdate = " + amikYear.value + "0100+" + amikWeek_ + "weeks| dykentry = " + amikText + "| dyklink = ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/" + header + "}}";
		api.postWithEditToken({
			action: 'edit',
			//title: "بحث:"+header,
			title: 'کاربر:Nightdevil/ز',
			text: wikitext,
			minor: false,
			summary: "افزودن الگوی تاریخچهٔ آمیک و ایجاد صفحهٔ بحث مقالهٔ [[" + header + "]] ([[وپ:اجآ|ابزار جمع‌بندی آمیک]])"
		}).done(function(result) {
			msgBox.setLabel("صفجه بحث مقاله ساخته شد و الگوی تاریخچه با موفقیت به آن افزوده شد. در حال افزودن الگوی {{بسته}} آمیک به این گفتگو.");
			closeSuccess(header, msgBox, currentBox, amikYear, amikWeek_, progressBar);
		}).fail(function(error) {
			msgBox.setLabel("خطا در ذخیره کردن الگوی هفته. عملیات متوقف شد.");
		});
	});
}

function closeSuccess(header, msgBox, currentBox, amikYear, amikWeek_, progressBar) {
	var api = new mw.Api();
	api.get({
		action: 'parse',
		prop: 'wikitext',
		format: 'json',
		page: "ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/" + header
	}).done(function(data) {
		var wikitext = getWiki(data, msgBox, header).replace(/(\=\=.+?=\=)/s, "$1\n{{بسته}}\n{{شد}} ~~" + "~~").replace("| هفته =", "| هفته =" + amikWeek_).replace("| سال =", "| سال =" + amikYear.value) + "{{پایان بسته}}";
		api.postWithEditToken({
			action: 'edit',
			//title: "ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/"+header,
			title: 'کاربر:Nightdevil/ذ',
			text: wikitext,
			minor: false,
			summary: "جمع‌بندی موفقانهٔ [[ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/" + header + "]] ([[وپ:اجآ|ابزار جمع‌بندی آمیک]])"
		}).done(function() {
			msgBox.setLabel("وظیفه با موفقیت انجام شد.");
			msgBox.setIcon("check");
			msgBox.setType("success");
			progressBar.$element.remove();
			currentBox.innerHTML += '<p>آمیک <b>' + header + '</b> به <a href="https://fa.wikipedia.org/wiki/ویکی‌پدیا:آیا می‌دانستید که...؟/' + amikYear.value + '/هفته ' + amikWeek_ + '">الگوی هفتهٔ ' + amikWeek_ + '</a> از سال ' + amikYear.value + ' افزوده شد.</p><p>تاریخچهٔ آمیک در <a href="https://fa.wikipedia.org/wiki/بحث:' + header + '">صفحهٔ بحث مقالهٔ ' + header + '</a> ثبت شد.</p><p>صفحهٔ <a href="https://fa.wikipedia.org/wiki/ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/' + header + '">گفتگوی پیش&zwnj;نویس آمیک</a> بسته شد.</p><div></div>';
			currentRow = currentBox.children[4];
			addArchiveButtons_(currentBox, header, false);
		}).fail(function() {
			msgBox.setLabel("خطا در دخیره الگوی جمع‌بندی بحث. عملیات ناموفق بود.");
		});
	}).fail(function() {
		msgBox.setLabel("خطا در ارتباط با سرور");
	});
}

function closeFailSuccess(header, msgBox, currentBox, progressBar, jamReason) {
	msgBox.setLabel("جمع‌بندی ناموفق (" + jamReason.value + ") موفقانه انجام شد." + header)
	msgBox.setIcon("check");
	msgBox.setType("success");
	progressBar.$element.remove();
	currentBox.innerHTML += '<p>صفحهٔ <a href="https://fa.wikipedia.org/wiki/ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/' + header + '">گفتگوی پیش&zwnj;نویس آمیک</a> بسته شد.</p><div></div>';
	currentRow = currentBox.children[2]
}

function addArchiveButtons_(currentBox, header, isSoft) {
	//  if(currentRow.parentElement.parentElement.tagName=='tbody'){
	//  var currentBox = currentRow.parentElement.parentElement;
	//  }else if(currentRow.parentElement.tagName=='tbody'){var currentBox = currentRow;}
	var archiveHardB = new OO.ui.ButtonWidget({
		label: "بایگانی",
		title: "بایگانی",
		flags: [''],
		icon: "folderPlaceholder"
	});
	archiveHardB.on("click", function() {
		// A simple dialog window.
		function MyDialog(config) {
			MyDialog.parent.call(this, config);
		}
		OO.inheritClass(MyDialog, OO.ui.Dialog);
		MyDialog.static.name = 'myDialog';
		MyDialog.prototype.initialize = function() {
			MyDialog.parent.prototype.initialize.call(this);
			this.content = new OO.ui.PanelLayout({
				padded: true,
				expanded: false
			});
			var pArr = [{
				data: "h",
				label: "2"
			}];
			var pagePref
			if(isSoft == false) {
				pagePref = "ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/بایگانی "
			} else {
				pagePref = 'ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/جمع‌بندی‌های نرم/بایگانی '
			}
			if(isSoft == false) {
				for(i = 0; i < archsTemp.length; i++) {
					pArr.push({
						data: archsTemp[i]['title'],
						label: pagePref + toFa(archsTemp[i]['title'])
					})
				}
			} else {
				for(i = 0; i < archsSofts.length; i++) {
					pArr.push({
						data: archsSofts[i]['title'],
						label: pagePref + toFa(archsSofts[i]['title'])
					})
				}
			}
			this.label0 = new OO.ui.LabelWidget({
				label: 'شمارهٔ بایگانی مورد نظر را انتخاب کنید یا شمارهٔ جدیدی وارد کنید'
			})
			var removeP = pArr.shift()
			this.pBox = new OO.ui.ComboBoxInputWidget({
				options: pArr,
				label: ":",
				labelPosition: "after",
				maxLength: 3,
				value: pArr[0]['data'],
				dir: "rtl"
			})
			this.pBox.$element[0].style = 'direction:"rtl"'
			this.pBox.$element[0].childNodes[3].childNodes[0].style = 'text-align:center'
			this.submitArch = new OO.ui.ButtonWidget({
				label: "ارسال «" + header.slice(0, 20) + "» به بایگانی انتخاب‌شده",
				flags: ['progressive']
			});
			this.submitArch.on("click", function() {
				if(myDialog.pBox.value == "") {
					myDialog.label1.setLabel("باید شمارهٔ بایگانی را مشخص کنید.")
				} else {
					var archNum = myDialog.pBox.value
					myDialog.label1.setLabel("در حال دریافت " + pagePref + toFa(archNum))
					myDialog.label0.$element.remove()
					myDialog.pBox.$element.remove()
					myDialog.submitArch.$element.remove()
					this.progressBar = new OO.ui.ProgressBarWidget({
						progress: false
					});
					myDialog.$body.append(this.progressBar.$element);
					api.get({
						action: 'parse',
						page: pagePref + toFa(archNum),
						prop: "wikitext",
						format: "json"
					}).done(function(data) {
						myDialog.label1.setLabel("بایگانی دریافت شد. در حال افزودن مبحث آمیک و ذخیره صفحه " + toFa(archNum))
						var preText = data.parse.wikitext['*'];
						archiveTransfer(preText)
					}).fail(function() {
						myDialog.label1.setLabel("این صفحه وجود ندارد. در حال ایجاد ‌‌ " + pagePref + toFa(archNum))
						var preText = "{{Archive navigation|" + archNum + "}}";
						archiveTransfer(preText)
					})

					function archiveTransfer(preText) {
						api.postWithEditToken({
							action: 'edit',
							//title:pagePref+toFa(archNum),
							title: 'کاربر:Nightdevil/د',
							text: preText + "\n{{ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/" + header + "}}",
							summary: "بایگانی پیش‌نویس آمیک [[ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/" + header + "]] ([[وپ:اجآ|ابزار جمع‌بندی آمیک]])"
						}).done(function() {
							myDialog.label1.setLabel("صفحه بایگانی ذخیره شد. در حال حذف زیرصفحه از صفحهٔ پیش‌نویس وپ:پامیک")
							api.get({
								action: 'parse',
								page: 'ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس',
								format: 'json',
								prop: 'wikitext'
							}).done(function(data) {
								var newText = data.parse.wikitext['*'].replace("{{ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/" + header + "}}", "")
								api.postWithEditToken({
									action: 'edit',
									//title:'ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس',
									title: 'کاربر:Nightdevil/پ',
									text: newText,
									summary: "بایگانی پیش‌نویس آمیک [[ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/" + header + "]] در [[" + pagePref + toFa(archNum) + "]] ([[وپ:اجآ|ابزار جمع‌بندی آمیک]])"
								}).done(function() {
									myDialog.label1.setLabel("صفحهٔ پیش‌نویس آمیک بایگانی شد. برای بستن این دیالوگ روی دکمهٔ ادامه کلیک کنید.")
									this.clDiag = new OO.ui.ButtonWidget({
										label: "ادامه",
										flags: ['progressive']
									});
									this.clDiag.on("click", function() {
										myDialog.close();
									})
									window.progressBar.$element.remove()
										//remove section from view
									if(currentBox.parentElement.parentElement.tagName == "div") {
										currentBox.parentElement.parentElement.innerHTML = "<div style='text-align: center; height: 100px; background-color: white; padding: 100px;'>آمیک " + header + " به بایگانی <a href='http://fa.wikipedia.org/wiki/ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/بایگانی " + toFa(archNum) + "'>ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/بایگانی " + toFa(archNum) + "</a> منتقل شد.</div>"
									} else {
										currentBox.parentElement.innerHTML = "<div style='text-align: center; height: 100px; background-color: white; padding: 100px;'>آمیک " + header + " به بایگانی <a href='http://fa.wikipedia.org/wiki/" + pagePref + toFa(archNum) + "'>" + pagePref + toFa(archNum) + "</a> منتقل شد.</div>"
									}
									clDiag.$element.style = "width:300"
									myDialog.$body.append(this.clDiag.$element);
								}).fail(function() {
									myDialog.label1.setLabel("خطا در ذخیره وپ:پامیک.")
								})
							}).fail(function() {
								myDialog.label1.setLabel("خطا در دریافت صفحهٔ وپ:پامیک از سرور.")
							})
						}).fail(function() {
							myDialog.label1.setLabel("خطا در ذخیره‌سازی صفحه.")
						})
					}
				}
			});
			this.label1 = new OO.ui.LabelWidget({
				label: ''
			})
			dBody = document.getElementsByClassName("oo-ui-window-body");
			//dBody[0].children[0].children[0].innerHTML=""
			//dBody[0].children[0].children[0].append(pBox.$element[0],submitArch.$element[0],label1.$element[0])
			this.stackLayout = new OO.ui.FieldsetLayout({
				items: [this.label0, this.pBox, this.submitArch, this.label1]
			});
			//for(i=0;i<this.stackLayout.length;i++){
			this.stackLayout.$element[0].children[1].style = "margin:69px;margin-top: 100px; text-align:center";
			this.$body.append(this.stackLayout.$element);
			this.$body.append(this.content.$element);
		};
		MyDialog.prototype.getBodyHeight = function() {
			//return this.content.$element.outerHeight( true );
			return 400;
		};
		var myDialog = new MyDialog({
			size: 'medium',
			escapable: false
		});
		myDialog.on("close", function() {
				console.log("closer")
			})
			// Create and append a window manager, which opens and closes the window.
		var windowManager = new OO.ui.WindowManager();
		$(document.body).append(windowManager.$element);
		windowManager.addWindows([myDialog]);
		// Open the window!
		windowManager.openWindow(myDialog);
	});
	//$(currentRow)[0].textContent ="";
	$(currentBox).append(archiveHardB.$element)
}

function getWiki(data, msgBox, header) {
	try {
		let pages = data.parse.wikitext;
		let firstKey = Object.keys(pages);
		return pages[firstKey];
	} catch(e) {
		msgBox.setLabel("خطا در خواندن [[ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/" + header + "]]. ممکن است عنوان آمیک پیشنهادی در صفحه پیش‌نویس اشتباه وارد شده باشد و باید دستی جمع‌بندی شود.")
	}
}

function postEdit_(wikitext, editSummary, pageName, header, msgBox, currentBox, progressBar, jamReason) {
	var api = new mw.Api();
	api.postWithEditToken({
		action: 'edit',
		//title: pageName,
		title: 'کاربر:Nightdevil/ش',
		text: wikitext,
		minor: false,
		summary: editSummary
	}).done(function(result) {
		closeFailSuccess(header, msgBox, currentBox, progressBar, jamReason);
		addArchiveButtons_(currentBox, header, false);
	});
}

function failClose(currentRow, header, jamReason) {
	OO.ui.confirm("آیا از جمع‌بندی ناموفق این پیشنهاد (" + header + ") اطمینان دارید؟ \n دلیل: " + jamReason.value).done(function(confirmed) {
		if(confirmed) {
			var msgBox = new OO.ui.MessageWidget({
				icon: 'pageSettings',
				type: 'notice',
				label: 'در حال پردازش درخواست — آغاز درخواست ویرایش، در حال دریافت اطلاعات بخش به‌منظور ویرایش.'
			});
			var progressBar = new OO.ui.ProgressBarWidget({
				progress: false
			});
			var currentBox = currentRow.parentElement.parentElement
			currentBox.innerHTML = "";
			$(currentBox).append(progressBar.$element);
			$(currentBox).append(msgBox.$element);
			//soft close
			if(jamReason.value == "جمع‌بندی نرم") {
				var api = new mw.Api();
				api.get({
					action: 'parse',
					page: "ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/" + header,
					prop: "wikitext",
					format: "json"
				}).done(function(data) {
					wikiText = data.parse.wikitext['*'].replace(/(\=\=.+?=\=)/s, "$1\n<small> </small>\n") + "{{جا:جمع‌بندی نرم پامیک}}";
					msgBox.setLabel('الگوی جمع‌بندی نرم پامیک تراگنجانیده شد. در حال ذخیرهٔ صفحهٔ پیش‌نویس ' + header)
					api.postWithEditToken({
						action: "edit",
						//title:"ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/"+header,
						title: 'کاربر:Nightdevil/س',
						text: wikiText,
						summary: "جمع‌بندی ناموفق [[ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/" + header + "]] (" + jamReason.value + ") ([[وپ:اجآ|ابزار جمع‌بندی آمیک]])"
					}).done(function() {
						closeFailSuccess(header, msgBox, currentBox, progressBar, jamReason)
						addArchiveButtons_(currentBox, header, true);
					}).fail(function() {
						msgBox.setLabel('خطا در ارتباط با سرور')
					})
				}).fail(function() {
					msgBox.setLabel('خطا در دریافت اطلاعات صفحه پیش‌نویس آمیک')
				})
			} else {
				//hard close fail
				$.ajax({
					url: "https://fa.wikipedia.org/w/api.php?action=parse&page=ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/" + header + "&prop=wikitext&format=json",
					success: function(data) {
						var wikitext = getWiki(data, msgBox, header).replace(/(\=\=.+?=\=)/s, "$1\n{{بسته|ناموفق=بله}}\n" + jamReason.value + "  ~~" + "~~") + "{{پایان بسته}}"
							//console.log(q2)
						var editSummary = "جمع‌بندی ناموفق [[ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/" + header + "]] (" + jamReason.value + ") ([[وپ:اجآ|ابزار جمع‌بندی آمیک]])"
						var pageName = "ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/" + header
						msgBox.setLabel('در حال پردازش درخواست — در حال ارسال اطلاعات به سرور')
						postEdit_(wikitext, editSummary, pageName, header, msgBox, currentBox, progressBar, jamReason);
					},
					error: function(xhr, error) {
						msgBox.setLabel('خطا در ارتباط با سرور')
						console.log(xhr);
						console.log(error);
					}
				});
			}
		} else {
			console.log('User clicked "Cancel" or closed the dialog.');
		}
	})
}

function addButtons_(currentRow, header) {
	//  var header = currentRow.parentElement.parentElement.parentElement.parentElement.children[0].children[1].id
	//  console.log(header)
	var currentBox = currentRow.parentElement.parentElement
		//دکمه جمع‌بندی
	var jamBandiB = new OO.ui.ButtonWidget({
		icon: "expand",
		label: "جمع‌بندی بحث آمیک",
		title: "جمع‌بندی بحث آمیک",
		flags: ['progressive']
	});
	jamBandiB.on("click", function() {
		if(jamBandiB.getIcon() == "expand") {
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
	$(currentRow)[0].textContent = "";
	$(currentRow).append(jamBandiB.$element)
		//نوار قالبش
	$(currentRow).append('<tr><td colspan="2"><div style="display: flex; justify-content: center;"></div></td></tr><tr style="display:none;"><td colspan=2 style="padding-bottom:10px; text-align:center"><div style="display: flex; justify-content: center;"></div></td></tr>');
	//دراپ‌داون انتخاب سال
	var amikYear = new OO.ui.DropdownInputWidget({
		options: [{
			data: "۲۰۲۲",
			label: "سال ۲۰۲۲"
		}, {
			data: "۲۰۲۳",
			label: "سال ۲۰۲۳"
		}, {
			data: "۲۰۲۴",
			label: "سال ۲۰۲۴"
		}],
		indicator: 'required',
		align: 'right'
	});
	//ورود هفته
	var currentTime = new Date()

	function week(year, month, day) {
		function serial(days) {
			return 86400000 * days;
		}

		function dateserial(year, month, day) {
			return(new Date(year, month - 1, day).valueOf());
		}

		function weekday(date) {
			return(new Date(date)).getDay() + 1;
		}

		function yearserial(date) {
			return(new Date(date)).getFullYear();
		}
		var date = year instanceof Date ? year.valueOf() : typeof year === "string" ? new Date(year).valueOf() : dateserial(year, month, day),
			date2 = dateserial(yearserial(date - serial(weekday(date - serial(1))) + serial(4)), 1, 3);
		return ~~((date - date2 + serial(weekday(date2) + 5)) / serial(7));
	}
	week(currentTime.getFullYear(), currentTime.getMonth() + 1, currentTime.getDate())
	var amikWeek = new OO.ui.NumberInputWidget({
		align: 'left',
		input: {
			value: week(currentTime.getFullYear(), currentTime.getMonth() + 1, currentTime.getDate()) + 1
		},
		min: 1,
		max: 53
	});
	amikWeek.$input[0].style = "text-align:center; display: block; margin:auto";
	amikWeek.$input[0].parentElement.style = "font-size:113.63%";
	//دکمه اعمال
	var doneB = new OO.ui.ButtonWidget({
		icon: "checkAll",
		label: "اعمال جمع‌بندی موفق",
		flags: ["primary", "progressive"],
		title: "اعمال جمع‌بندی موفق"
	});
	doneB.on("click", function() {
			OO.ui.confirm("آیا از جمع‌بندی موفقانهٔ این پیشنهاد (" + header + ") اطمینان دارید؟").done(function(confirmed) {
				if(confirmed) {
					//msg box
					var msgBox = new OO.ui.MessageWidget({
						icon: 'pageSettings',
						type: 'notice',
						label: 'در حال پردازش درخواست — آغاز درخواست ویرایش، در حال دریافت اطلاعات بخش به‌منظور ویرایش.'
					});
					var progressBar = new OO.ui.ProgressBarWidget({
						progress: false
					});
					currentBox.innerHTML = "";
					$(currentBox).append(progressBar.$element);
					$(currentBox).append(msgBox.$element);
					//
					var amikWeek_ = amikWeek.value.replace(/1/g, "۱").replace(/2/g, "۲").replace(/3/g, "۳").replace(/4/g, "۴").replace(/5/g, "۵").replace(/6/g, "۶").replace(/7/g, "۷").replace(/8/g, "۸").replace(/9/g, "۹").replace(/0/g, "۰")
					var amikWeekURL = "ویکی‌پدیا:آیا می‌دانستید که...؟/" + amikYear.value + "/هفته " + amikWeek_
						//get amikText
					var api = new mw.Api();
					api.get({
						action: 'parse',
						prop: 'wikitext',
						format: 'json',
						page: "ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/" + header
					}).done(function(data) {
						var amikText = getWiki(data, msgBox, header).match(/\{\{گفتاورد\|(.*?)؟/)[0].substring(10);
						var amikTextOp = getWiki(data, msgBox, header).match(/\{\{گفتاورد\|(.*?)؟/g);
						if (getWiki(data, msgBox, header).match(/\[\[پرونده:(.*?)\|/)){
							var amikImage = getWiki(data, msgBox, header).match(/\[\[پرونده:(.*?)\|/)[0].substring(9).slice(0,-1);
							}else{var amikImage = null;}
						editFinalText(amikText, amikWeekURL, msgBox, header, amikYear, amikWeek_, currentBox, progressBar, amikTextOp, topLayout, amikImage)
					}).fail(function(error) {
						msgBox.setLabel("خطا در خواندن [[ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/" + header + "]]. ممکن است عنوان آمیک پیشنهادی در صفحه پیش‌نویس اشتباه وارد شده باشد و باید دستی جمع‌بندی شود.")
						console.log("failed")
					});
				}
			});
		})
		//دراپ‌داون انتخاب سال
	var jamReason = new OO.ui.DropdownInputWidget({
		options: [{
			data: "جمع‌بندی نرم"
		}, {
			data: "مقاله کمتر از ۲۰۰ کلمه"
		}, {
			data: "بدون منبع معتبر"
		}, {
			data: "عدم جذابیت"
		}, {
			data: "نقض معیارهای عمومی آمیک"
		}, {
			data: "عدم اجماع کاربران"
		}],
		indicator: 'required',
		label: 'دلیل جمع‌بندی ناموفق',
		labelPosition: 'before',
		align: 'center'
	});
	//دکمه جمع‌بندی ناموفق
	var jamBandiNo = new OO.ui.ButtonWidget({
		icon: "clear",
		label: "جمع‌بندی ناموفق آمیک",
		title: "جمع‌بندی ناموفق آمیک",
		flags: ["primary", "destructive"],
	});
	jamBandiNo.on("click", function() {
		failClose(currentRow, header, jamReason);
	});
	//ایجاد نوار 
	var hzLayoutT = new OO.ui.FieldsetLayout({
		label: '',
		helpInline: true,
		help: "دلیل جمع‌بندی ناموفق"
	});
	var topLayout = new OO.ui.FieldsetLayout({
		helpInline: true,
		help: "مشخص کنید که آمیک در چه هفته از چه سالی در صفحهٔ اصلی نمایش یابد. الان در هفتهٔ " + toFa(week(currentTime.getFullYear(), currentTime.getMonth() + 1, currentTime.getDate())) + "م از سال " + toFa(currentTime.getFullYear()) + " هستیم"
	});
	amikYear.$element.style = "width:50%";
	topLayout.addItems([amikYear, amikWeek, doneB]);
	hzLayoutT.addItems([jamReason, jamBandiNo]);
	$(currentRow.children[2]).append(topLayout.$element);
	$(currentRow.children[2]).append(hzLayoutT.$element);
}

function toFa(foo) {
	return foo.toString().replace(/1/g, "۱").replace(/2/g, "۲").replace(/3/g, "۳").replace(/4/g, "۴").replace(/5/g, "۵").replace(/6/g, "۶").replace(/7/g, "۷").replace(/8/g, "۸").replace(/9/g, "۹").replace(/0/g, "۰")
}

function toEn(foo) {
	return foo.toString().replace(/۱/g, 1).replace(/۲/g, 2).replace(/۳/g, 3).replace(/۴/g, 4).replace(/۵/g, 5).replace(/۶/g, 6).replace(/۷/g, 7).replace(/۸/g, 8).replace(/۹/g, 9).replace(/۰/g, 0)
}

if(document.title.slice(0, 27) == 'ویکی‌پدیا:آیا می‌دانستید که' || document.title.slice(0, 27) == 'کاربر:Nightdevil/صفحه تمرین') {
	var amikBoxes = document.getElementsByClassName("infobox")
	if(amikBoxes.length != 0) {
		mw.loader.using(["oojs-ui-core", "oojs-ui-widgets", "oojs-ui-windows"]).done(function() {
			mw.loader.load(["oojs-ui.styles.icons-alerts", "oojs-ui.styles.icons-interactions", "oojs-ui.styles.icons-moderation", "oojs-ui.styles.icons-user", "oojs-ui.styles.icons-content", "oojs-ui.styles.icons-editing-core", "oojs-ui.styles.icons-editing-advanced"]);
			for(var i = 0; i < amikBoxes.length; i++) {
				var currentBox = amikBoxes[i].children[0]; //تعریف فضای فعلی
				var header = amikBoxes[i].getElementsByClassName("infobox-header")[0].textContent.replace('بررسی آمیک ', ''); //گرفتن عنوان
				//var header = amikBoxes[i].previousElementSibling.previousElementSibling.previousElementSibling.children[1].id;
				//console.log(header)
				var currentRow = currentBox.children[6].children[0]; //تعریف نوار
				if(amikBoxes[i].parentElement.children[0].tagName == "SMALL") { //چک کردن اینکه قبلا بسته شده است (hard)
					var isSoft = false;
					addArchiveButtons_(currentBox, header, isSoft);
				} else if(amikBoxes[i].children[0].children[0].children[0].textContent.slice(6, 10) == "آمیک") {
					addButtons_(currentRow, header); //افزودن دکمه جمع‌بندی
				}
			}
		})
	}
	//get archives list
	var api = new mw.Api();
	api.get({
		action: 'query',
		list: 'allpages',
		apnamespace: 4,
		apprefix: 'آیا می‌دانستید که...؟/پیش‌نویس/بایگانی ',
		format: 'json',
		aplimit: 'max',
		apfilterredir: 'nonredirects'
	}).done(function(data) {
		console.log("successfully got archive data")
		var archs = data.query.allpages;
		archsTemp = data.query.allpages;
		for(i = 0; i < archs.length; i++) {
			archsTemp[i]['title'] = parseInt(toEn(archsTemp[i]['title'].replace('ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/بایگانی ', "")), 10)
			archsTemp = archsTemp.sort((a, b) => b.title - a.title)
		}
	}).fail(function() {
		console.log("error getting archive data");
	});
	//get soft archives list
	api.get({
		action: 'query',
		list: 'allpages',
		apnamespace: 4,
		apprefix: 'آیا می‌دانستید که...؟/پیش‌نویس/جمع‌بندی‌های نرم/بایگانی ',
		format: 'json',
		aplimit: 'max',
		apfilterredir: 'nonredirects'
	}).done(function(data) {
		console.log("successfully got soft archives data");
		var archs = data.query.allpages;
		archsSofts = data.query.allpages;
		for(i = 0; i < archs.length; i++) {
			archsSofts[i]['title'] = parseInt(toEn(archsSofts[i]['title'].replace('ویکی‌پدیا:آیا می‌دانستید که...؟/پیش‌نویس/جمع‌بندی‌های نرم/بایگانی ', "")), 10);
			archsSofts = archsSofts.sort((a, b) => b.title - a.title);
		}
	}).fail(function() {
		console.log("error getting soft archives data");
	});
} else {
	//    console.log("not dyk")
}