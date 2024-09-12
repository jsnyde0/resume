from django.shortcuts import render, redirect
from django.contrib import messages
import plotly.express as px
import plotly.io as pio
import json

def view_home(request):
    return render(request, 'home.html')

def view_resume(request):
    skills_data = {
        "name": "Role",
        "children": [
            {
                "name": "Web Developer",
                "children": [
                    {
                        "name": "Back-End",
                        "children": [
                            {"name": "Django"},
                            {"name": "PostgreSQL, SQLite"}
                        ]
                    },
                    {
                        "name": "Front-end",
                        "children": [
                            {"name": "HTML, CSS"},
                            {"name": "HTMX, Tailwind, Cotton"},
                            {"name": "Chart.js, D3.js"},
                            {"name": "JavaScript (basic)"}
                        ]
                    },
                    {
                        "name": "Analytics",
                        "children": [
                            {"name": "Posthog"},
                            {"name": "GA4"},
                            {"name": "Server-side Tracking"}
                        ]
                    },
                    {
                        "name": "Deployment",
                        "children": [
                            {"name": "DigitalOcean"},
                            {"name": "Render.com"}
                        ]
                    },
                    {
                        "name": "Data Pipelines",
                        "children": [
                            {"name": "BigQuery"},
                            {"name": "Dataform"}
                        ]
                    }
                ]
            },
            {
                "name": "Data Scientist",
                "children": [
                    {"name": "Python, C++"},
                    {"name": "Algorithm and library development"},
                    {"name": "Machine Learning (Sci-kit Learn, Numpy, Pandas, ...)"},
                    {"name": "Bayesian Modelling (PyMC, MMM)"},
                    {"name": "Computer vision & Deep learning (OpenCV, Keras)"},
                    {"name": "Dashboarding (Looker)"}
                ]
            },
            {
                "name": "Growth Engineer",
                "children": [
                    {"name": "Performance marketing (FB, Google, TikTok)"},
                    {"name": "Growth Experimenting"},
                    {"name": "SEO"},
                    {"name": "CRO"},
                    {"name": "Marketing Automation (Affiliate, Email, ...)"}
                ]
            },
            {
                "name": "Ex-Founder",
                "children": [
                    {"name": "Vision & Strategy"},
                    {"name": "HR & Team (Holacracy)"},
                    {"name": "Finance"},
                    {"name": "Sales"},
                    {"name": "Project Management (Asana, GTD)"},
                    {"name": "Learning from failures"}
                ]
            }
        ]
    }

    sunburst_data = prepare_sunburst_data(skills_data)

    fig = px.sunburst(
        sunburst_data,
        names='name',
        parents='parent',
        values='value',
    )
    
    plot_div = pio.to_html(fig, full_html=False)

    context = {
        'skills_data': json.dumps(skills_data),
        'sunburst_plot': plot_div
    }

    return render(request, 'resume.html', context)

def prepare_sunburst_data(skills_data):
    data = []
    def flatten(item, parent=""):
        data.append({"name": item["name"], "parent": parent, "value": 1})
        for child in item.get("children", []):
            flatten(child, item["name"])
    
    flatten(skills_data)
    return data

def download_cv(request):
    messages.warning(request, "All this effort for an online resume, and you want a PDF? (I just haven't had the time yet)")
    return redirect('resume')