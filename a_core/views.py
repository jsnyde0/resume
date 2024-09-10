from django.shortcuts import render, redirect
from django.contrib import messages

def view_home(request):
    return render(request, 'home.html')

def view_resume(request):
    skills_data = {
        "PROGRAMMING": {
            "Python": None,
            "C++": None,
            "SQL": None
        },
        "DATA": {
            "Data Science": [
                "Data Analysis and Modeling (Sci-kit Learn, Numpy, Pandas)",
                "Bayesian Inference (PyMC)"
            ],
            "Technical Marketing": [
                "Data Pipelines (BigQuery, Dataform) and Dashboards (Looker Studio)",
                "Server-side Tracking (Server GTM)",
                "Analytics (GA4, Amplitude)"
            ]
        },
        "MARKETING": {
            "Performance Marketing": [
                "Facebook Ads (Advanced), Google Ads (Basic)"
            ],
            "SEO": [
                "Content Strategy, Keyword Research (Ahrefs), Technical SEO"
            ],
            "CRO": [
                "CRO Research (Hotjar), AB test implementation (convert.com) and evaluation"
            ],
            "Marketing Automation": [
                "Affiliate and Referral Programs",
                "Automated Email Campaigns (Klaviyo, ActiveCampaign)",
                "Popups, surveys,..."
            ]
        },
        "STARTUP STUFF": {
            "Finance": [
                "planning, budgeting, cashflow management"
            ],
            "Governance": [
                "Holacracy"
            ],
            "Sales and Negotiations": None,
            "Project Management": [
                "Asana, Getting Things Done"
            ]
        }
    }

    context = {
        'skills_data': skills_data
    }

    return render(request, 'resume.html', context)

def download_cv(request):
    messages.warning(request, "All this effort for an online resume, and you want a PDF? (I just haven't had the time yet)")
    return redirect('resume')