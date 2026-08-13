import json
from datetime import datetime, timedelta
import random
from .database import engine, Base, SessionLocal
from . import models

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if forms already exist
    if db.query(models.Form).count() > 0:
        print("Database already has forms seeded.")
        db.close()
        return

    print("Seeding database with sample Typeform forms and responses...")

    # Form 1: Customer Satisfaction & Product Feedback
    form1 = models.Form(
        title="Customer Satisfaction & Feedback Survey 2026",
        description="Help us improve Typeform by sharing your honest experience and feedback.",
        status="published",
        theme_color="#792F9B",
        font_family="Inter",
        thank_you_title="Thank you for sharing your feedback!",
        thank_you_message="Your insights help us craft a more people-friendly product every day."
    )
    db.add(form1)
    db.commit()
    db.refresh(form1)

    questions_f1 = [
        models.Question(
            form_id=form1.id,
            type="rating",
            title="Overall, how satisfied are you with our product?",
            description="1 star means very dissatisfied, 5 stars means delighted.",
            required=True,
            order=0,
            min_val=1,
            max_val=5
        ),
        models.Question(
            form_id=form1.id,
            type="multiple_choice",
            title="Which feature do you use most frequently?",
            description="Select the one that powers your core daily workflow.",
            required=True,
            order=1,
            choices_json=json.dumps(["Interactive Form Builder", "Growth Flow Automations", "Research Flow AI", "Analytics & CSV Export"])
        ),
        models.Question(
            form_id=form1.id,
            type="yes_no",
            title="Would you recommend Typeform to a colleague or friend?",
            description="Your honest recommendation helps us grow.",
            required=True,
            order=2
        ),
        models.Question(
            form_id=form1.id,
            type="dropdown",
            title="What is your primary team role?",
            description="Help us tailor product updates for your discipline.",
            required=False,
            order=3,
            choices_json=json.dumps(["Product Management", "Marketing & Growth", "UX Research", "Engineering", "Customer Support & HR"])
        ),
        models.Question(
            form_id=form1.id,
            type="long_text",
            title="What is one improvement or new feature you would love to see?",
            description="Be as detailed as you like!",
            required=False,
            order=4
        ),
        models.Question(
            form_id=form1.id,
            type="email",
            title="Please enter your email address if you'd like us to follow up.",
            description="We respect your privacy and will never send spam.",
            required=False,
            order=5
        )
    ]
    for q in questions_f1:
        db.add(q)
    db.commit()

    # Seed 8 responses for Form 1
    sample_responses_f1 = [
        (5, "Interactive Form Builder", "Yes", "Product Management", "Dark mode customization and faster keyboard shortcuts would be awesome!", "alex.dev@gmail.com"),
        (4, "Growth Flow Automations", "Yes", "Marketing & Growth", "More webhook triggers for custom CRM integrations.", "sarah.mktg@stripe.com"),
        (5, "Research Flow AI", "Yes", "UX Research", "AI summary insights delivered directly via Slack digest.", "elena.ux@design.co"),
        (3, "Analytics & CSV Export", "No", "Engineering", "Slightly faster load times when embedding public forms.", "jason.eng@company.org"),
        (5, "Interactive Form Builder", "Yes", "Product Management", "Love the one-question-at-a-time experience. Keep up the great work!", "clara.pm@startup.io"),
        (4, "Interactive Form Builder", "Yes", "Customer Support & HR", "Better multi-language translations for global survey takers.", "marcus.hr@globaltech.com"),
        (5, "Growth Flow Automations", "Yes", "Marketing & Growth", "Instant lead enrichment match is super helpful.", "diana.growth@agency.net"),
        (4, "Research Flow AI", "Yes", "UX Research", "Video response uploads in research flow.", "david.research@insights.io")
    ]

    for idx, resp_data in enumerate(sample_responses_f1):
        resp = models.Response(
            form_id=form1.id,
            submitted_at=datetime.utcnow() - timedelta(days=random.randint(0, 10), hours=random.randint(1, 20)),
            completion_time_seconds=random.randint(45, 180)
        )
        db.add(resp)
        db.commit()
        db.refresh(resp)

        for q_idx, val in enumerate(resp_data):
            q_id = questions_f1[q_idx].id
            ans = models.Answer(
                response_id=resp.id,
                question_id=q_id,
                value_json=json.dumps(val)
            )
            db.add(ans)
    db.commit()

    # Form 2: Product Feature Request & Market Research
    form2 = models.Form(
        title="Product Feature Request & Market Research",
        description="We are building the future of automated workflows. Give us your input!",
        status="published",
        theme_color="#00A86B",
        font_family="Roboto",
        thank_you_title="Your feature request has been received!",
        thank_you_message="Our product team reviews every submission during sprint planning."
    )
    db.add(form2)
    db.commit()
    db.refresh(form2)

    questions_f2 = [
        models.Question(
            form_id=form2.id,
            type="short_text",
            title="What is your company or project name?",
            description="Optional field",
            required=False,
            order=0
        ),
        models.Question(
            form_id=form2.id,
            type="multiple_choice",
            title="Which platform integration is most critical for your business?",
            description="Choose the integration you rely on most.",
            required=True,
            order=1,
            choices_json=json.dumps(["Salesforce CRM", "HubSpot Marketing", "Notion Databases", "Google Sheets & Workspace", "Slack / Microsoft Teams"])
        ),
        models.Question(
            form_id=form2.id,
            type="rating",
            title="How important is real-time AI logic branching to your workflow?",
            description="1 = Not important, 5 = Essential",
            required=True,
            order=2,
            min_val=1,
            max_val=5
        ),
        models.Question(
            form_id=form2.id,
            type="yes_no",
            title="Are you interested in participating in private beta testing?",
            description="Get early access to cutting-edge features before launch.",
            required=True,
            order=3
        ),
        models.Question(
            form_id=form2.id,
            type="email",
            title="Enter your business email address",
            description="We will send beta invitations to this address.",
            required=True,
            order=4
        )
    ]
    for q in questions_f2:
        db.add(q)
    db.commit()

    # Seed 5 responses for Form 2
    sample_responses_f2 = [
        ("Acme Corp", "Salesforce CRM", 5, "Yes", "contact@acme.com"),
        ("Vanguard Labs", "HubSpot Marketing", 4, "Yes", "beta@vanguardlabs.io"),
        ("Pixel Studio", "Notion Databases", 5, "Yes", "hello@pixelstudio.design"),
        ("CloudScale", "Google Sheets & Workspace", 3, "No", "dev@cloudscale.net"),
        ("Nexus AI", "Slack / Microsoft Teams", 5, "Yes", "team@nexusai.tech")
    ]

    for resp_data in sample_responses_f2:
        resp = models.Response(
            form_id=form2.id,
            submitted_at=datetime.utcnow() - timedelta(days=random.randint(0, 5)),
            completion_time_seconds=random.randint(30, 120)
        )
        db.add(resp)
        db.commit()
        db.refresh(resp)

        for q_idx, val in enumerate(resp_data):
            ans = models.Answer(
                response_id=resp.id,
                question_id=questions_f2[q_idx].id,
                value_json=json.dumps(val)
            )
            db.add(ans)
    db.commit()

    # Form 3: Draft Form Example
    form3 = models.Form(
        title="Annual Employee Engagement Survey (Draft)",
        description="Internal HR survey template ready for publication.",
        status="draft",
        theme_color="#3B82F6",
        font_family="Inter",
        thank_you_title="Thank you!",
        thank_you_message="Your feedback helps build a healthier workspace."
    )
    db.add(form3)
    db.commit()

    questions_f3 = [
        models.Question(
            form_id=form3.id,
            type="rating",
            title="How would you rate your work-life balance this quarter?",
            required=True,
            order=0,
            min_val=1,
            max_val=5
        ),
        models.Question(
            form_id=form3.id,
            type="yes_no",
            title="Do you feel supported by your immediate manager?",
            required=True,
            order=1
        )
    ]
    for q in questions_f3:
        db.add(q)
    db.commit()

    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
