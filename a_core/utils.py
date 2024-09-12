import plotly.express as px
import plotly.io as pio

def get_skills_data():
    return {
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

    
def prepare_sunburst_data(skills_data):
    data = []
    def flatten(item, parent=""):
        data.append({"name": item["name"], "parent": parent, "value": 1})
        for child in item.get("children", []):
            flatten(child, item["name"])
    
    flatten(skills_data)
    return data

def create_sunburst_plot(sunburst_data):
    fig = px.sunburst(
        sunburst_data,
        names='name',
        parents='parent',
        values='value',
    )
    fig.update_layout(
        margin=dict(t=0, l=0, r=0, b=0),
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)'
    )
    return pio.to_html(fig, full_html=False, config={'responsive': True})